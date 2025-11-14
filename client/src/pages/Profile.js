import { useState, useEffect, useMemo, useRef } from 'react';
import { catchErrors } from '../utils';
import { accessToken, getCurrentUserProfile, getMeetingList } from '../zoom';
import { StyledHeader } from '../styles';
import { SectionWrapper, MeetingList } from '../components';

// Zoom Meeting SDK (Web, Embedded Client)
import { ZoomMtg } from '@zoom/meetingsdk';
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';

// (Optional) Pin SDK asset version for stability
ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

const sdkKey = process.env.REACT_APP_ZOOM_SDK_KEY; // public key only

const BUSY_STATUSES = ['creating', 'initializing', 'joining'];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [type, setType] = useState(null);
  const [userMeetingList, setMeetingList] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | creating | initializing | joining | joined | error
  const [currentMeeting, setCurrentMeeting] = useState(null); // { meetingNumber, password }

  const containerRef = useRef(null);
  const zoomClientRef = useRef(null);
  const initedRef = useRef(false);
  const clientListenersRef = useRef(false);
  const statusRef = useRef(status);

  // If you use CRA proxy ("proxy": "http://localhost:8888"), leave this as ''.
  // Otherwise set REACT_APP_API_BASE=http://localhost:8888 in your client .env
  const API_BASE = useMemo(() => process.env.REACT_APP_API_BASE ?? '', []);
  const credOpt = useMemo(
    () => (API_BASE && /^https?:\/\//.test(API_BASE) ? { credentials: 'include' } : {}),
    [API_BASE]
  );

  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      const { data } = await getCurrentUserProfile();
      setProfile(data);

      switch (data.type) {
        case 1: setType('Basic'); break;
        case 2: setType('Licensed'); break;
        case 3: setType('On-prem'); break;
        default: setType('None');
      }

      const response = await getMeetingList();
      setMeetingList(response.data.meetings || []);
    };

    catchErrors(fetchData());
  }, []);

  const ensureClient = () => {
    if (!zoomClientRef.current) {
      zoomClientRef.current = ZoomMtgEmbedded.createClient();
    }
    return zoomClientRef.current;
  };

  const resetMeetingState = (nextStatus = 'idle') => {
    setStatus(nextStatus);
    setCurrentMeeting(null);
  };

  const tearDownClient = async () => {
    const client = zoomClientRef.current;
    if (!client) return;
    try {
      await client.leave();
    } catch (e) {
      console.error(e);
    }
    try {
      await client.cleanup?.();
    } catch (e) {
      console.error(e);
    }
    zoomClientRef.current = null;
    initedRef.current = false;
    clientListenersRef.current = false;
  };

  const initClientIfNeeded = async () => {
    const client = ensureClient();
    if (!initedRef.current) {
      await client.init({
        zoomAppRoot: containerRef.current,
        language: 'en-US',
        customize: {
          video: { isResizable: true },
          toolbar: { buttons: ['microphone', 'camera', 'participants', 'chat', 'share'] }
        }
      });
      initedRef.current = true;
    }

    if (!clientListenersRef.current) {
      client.on('connection-change', ({ state }) => {
        if (['Closed', 'Disconnected'].includes(state)) {
          tearDownClient().finally(() => resetMeetingState('idle'));
        }
      });

      client.on('leave-meeting', () => {
        tearDownClient().finally(() => resetMeetingState('idle'));
      });

      client.on('meeting-status-change', ({ meetingStatus }) => {
        const normalized = String(meetingStatus || '').toUpperCase();
        if (normalized === 'MEETING_STATUS_FAILED' || normalized === 'MEETING_STATUS_UNKNOWN') {
          tearDownClient().finally(() => resetMeetingState('error: meeting failed'));
          return;
        }

        if (normalized === 'MEETING_STATUS_IDLE') {
          const errorLike = typeof statusRef.current === 'string' && statusRef.current.startsWith('error');
          if (statusRef.current === 'joined' || errorLike) {
            tearDownClient().finally(() => resetMeetingState('idle'));
          }
          return;
        }

        const idleStatuses = [
          'MEETING_STATUS_DISCONNECTING',
          'MEETING_STATUS_ENDED',
          'MEETING_STATUS_RECONNECTING',
          'MEETING_STATUS_DISCONNECTED'
        ];
        if (idleStatuses.includes(normalized)) {
          tearDownClient().finally(() => resetMeetingState('idle'));
        }
      });

      clientListenersRef.current = true;
    }
    return client;
  };

  const endMeetingBackend = async (meetingNumber) => {
    if (!meetingNumber) return;
    try {
      await fetch(`${API_BASE}/zoom/meetings/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...credOpt,
        body: JSON.stringify({ meetingNumber })
      });
    } catch (e) {
      console.error('Failed to end meeting remotely', e);
    }
  };

  const startInstantMeeting = async () => {
    try {
      if (currentMeeting?.meetingNumber) {
        await endMeetingBackend(currentMeeting.meetingNumber);
      }
      await tearDownClient();
      resetMeetingState('idle');
      setStatus('creating');

      const resp = await fetch(`${API_BASE}/zoom/meetings/instant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...credOpt,
        body: JSON.stringify({})
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to create instant meeting');

      const m = { meetingNumber: String(data.meetingNumber), password: data.password || '' };
      setCurrentMeeting(m);
      await joinMeeting(m, 1);
    } catch (e) {
      console.error(e);
      setStatus(`error: ${e.message}`);
    }
  };

  const startFromExisting = async (meetingNumber) => {
    try {
      if (currentMeeting?.meetingNumber) {
        await endMeetingBackend(currentMeeting.meetingNumber);
      }
      await tearDownClient();
      resetMeetingState('idle');

      const resp = await fetch(`${API_BASE}/zoom/meetings/${meetingNumber}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        ...credOpt
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to fetch meeting details');

      const m = {
        meetingNumber: String(data.id || meetingNumber),
        password: data.password || data.passcode || ''
      };
      setCurrentMeeting(m);
      await joinMeeting(m, 1);
    } catch (e) {
      console.error(e);
      setStatus(`error: ${e.message}`);
    }
  };

  const joinMeeting = async ({ meetingNumber, password }, role) => {
    try {
      setStatus('initializing');

      const client = await initClientIfNeeded();

      const sigResp = await fetch(`${API_BASE}/zoom/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...credOpt,
        body: JSON.stringify({ meetingNumber, role }) // 1 = host, 0 = attendee
      });
      const sigData = await sigResp.json();
      if (!sigResp.ok || !sigData.signature) {
        throw new Error(sigData.error || 'Failed to obtain signature');
      }

      setStatus('joining');

      await client.join({
        sdkKey,
        signature: sigData.signature,
        meetingNumber,
        password,
        userName: profile?.first_name ? `${profile.first_name} (Embedded)` : 'Host (Embedded)'
      });

      setStatus('joined');
    } catch (e) {
      console.error(e);
      setStatus(`error: ${e.message}`);
    }
  };

  // Leave locally (no prompt)
  const leaveMeeting = async ({ endOnServer = true } = {}) => {
    if (endOnServer && currentMeeting?.meetingNumber) {
      await endMeetingBackend(currentMeeting.meetingNumber);
    }
    await tearDownClient();
    resetMeetingState('idle');
  };

  // End for everyone via backend (host + meeting:write scope or S2S admin)
  const endMeetingForAll = async () => {
    if (!currentMeeting?.meetingNumber) return;
    try {
      await endMeetingBackend(currentMeeting.meetingNumber);
      await leaveMeeting({ endOnServer: false });
    } catch (e) {
      console.error(e);
      await leaveMeeting({ endOnServer: false });
    }
  };

  // Escape key to leave (nice UX)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && status === 'joined') {
        leaveMeeting();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      (async () => {
        try { await leaveMeeting(); } catch {}
      })();
    };
  }, []);

  useEffect(() => {
    statusRef.current = status;
    if (status === 'joined' && !zoomClientRef.current) {
      resetMeetingState('idle');
    }
  }, [status]);

  const zoomClass = 'zoom-embed-inline';
  const statusModifier = useMemo(() => (status.startsWith('error') ? 'error' : status), [status]);

  const handleMeetingSelect = (meeting) => {
    startFromExisting(meeting.id);
  };

  return (
    <>
          {profile && (
            <>
              <StyledHeader type="user">
                <div className="header__inner">
                  {profile.pic_url && <img className="header__img" src={profile.pic_url} alt="Avatar" />}
                  <div className="header__content">
                    <div className="header__overline">Profile</div>
                    <h1 className="header__name">{profile.first_name}</h1>
                    <p className="header__meta"><span>{type}</span></p>
                  </div>
                </div>
          </StyledHeader>

          <main>
            <SectionWrapper>
              <div className="profile-layout">
                <section className="profile-panel profile-meetings">
                  <div className="profile-meetings__header">
                    <div>
                      <span className="meeting-stage__eyebrow">Upcoming</span>
                      <h3>Meetings</h3>
                    </div>
                    {userMeetingList && <span>{userMeetingList.length} scheduled</span>}
                  </div>
                  {userMeetingList ? (
                    userMeetingList.length ? (
                      <MeetingList meetings={userMeetingList} onSelect={handleMeetingSelect} />
                    ) : null
                  ) : (
                    <p className="empty-notice">Fetching your meeting list…</p>
                  )}
                </section>

                <section className="profile-panel profile-stage">
                  <div className="meeting-stage">
                    <div className="meeting-stage__header">
                      <div>
                        <p className="meeting-stage__eyebrow">Embedded Zoom</p>
                        <h3>Live Meeting</h3>
                      </div>
                      <span className={`meeting-stage__status meeting-stage__status--${statusModifier}`}>
                        {status}
                      </span>
                    </div>

                    <div className="meeting-video-shell">
                      <div className="meeting-video-wrapper">
                        <div ref={containerRef} id="zoom-embedded-container" className={zoomClass} />
                        {status !== 'joined' && (
                          <div className="meeting-video-placeholder">
                            <p>
                              Your meeting will stream directly inside this window once you start or join one.
                              Launch an instant session below or tap any upcoming event.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="meeting-stage__footer">
                      <button
                        onClick={startInstantMeeting}
                        disabled={BUSY_STATUSES.includes(status)}
                        className="btn meeting-stage__cta"
                      >
                        Start Instant Meeting
                      </button>
                      <div className="meeting-actions__status">Status: {status}</div>
                    </div>
                  </div>
                </section>
              </div>
            </SectionWrapper>
          </main>

          {/* Floating controls removed per request */}
        </>
      )}
    </>
  );
};

export default Profile;

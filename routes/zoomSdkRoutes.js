import express from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch';

const router = express.Router();

const hasS2SCreds = () =>
  Boolean(
    process.env.ZOOM_S2S_ACCOUNT_ID &&
    process.env.ZOOM_S2S_CLIENT_ID &&
    process.env.ZOOM_S2S_CLIENT_SECRET
  );

const fetchS2SBearer = async () => {
  const basic = Buffer.from(
    `${process.env.ZOOM_S2S_CLIENT_ID}:${process.env.ZOOM_S2S_CLIENT_SECRET}`
  ).toString('base64');

  const tResp = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_S2S_ACCOUNT_ID}`,
    { method: 'POST', headers: { Authorization: `Basic ${basic}` } }
  );
  const tText = await tResp.text();
  if (!tResp.ok) {
    const err = new Error(tText || 'Failed to acquire S2S token');
    err.status = tResp.status;
    throw err;
  }
  const { access_token } = JSON.parse(tText);
  return `Bearer ${access_token}`;
};

const getSessionBearer = (req, message = 'Log in to Zoom first') => {
  const token = req.session?.accessToken;
  const type = req.session?.tokenType || 'Bearer';
  if (!token) {
    const err = new Error(message);
    err.status = 401;
    throw err;
  }
  return `${type} ${token}`;
};

const getZoomBearer = async (req, { preferS2S = true, sessionMessage } = {}) => {
  if (preferS2S && hasS2SCreds()) {
    return fetchS2SBearer();
  }
  return getSessionBearer(
    req,
    sessionMessage || 'No Zoom token in session. Log in or configure S2S credentials.'
  );
};

/**
 * POST /zoom/signature
 */
router.post('/zoom/signature', (req, res) => {
  try {
    const { meetingNumber, role = 0 } = req.body || {};
    const sdkKey = process.env.ZOOM_SDK_KEY;
    const sdkSecret = process.env.ZOOM_SDK_SECRET;

    if (!sdkKey || !sdkSecret) return res.status(500).json({ error: 'Missing SDK credentials' });
    if (!meetingNumber) return res.status(400).json({ error: 'Missing meetingNumber' });

    const header = { alg: 'HS256', typ: 'JWT' };
    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 120;

    const payload = {
      sdkKey,
      mn: String(meetingNumber),
      role: Number(role),
      iat,
      exp,
      appKey: sdkKey,
      tokenExp: exp
    };

    const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const toSign = `${b64(header)}.${b64(payload)}`;
    const sig = crypto.createHmac('sha256', sdkSecret).update(toSign).digest('base64url');

    res.json({ signature: `${toSign}.${sig}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /zoom/meetings/instant
 */
router.post('/zoom/meetings/instant', async (req, res) => {
  try {
    const bearer = await getZoomBearer(req, {
      sessionMessage:
        'No S2S creds and no user access token in session. Log in to Zoom first or configure S2S credentials.'
    });

    const mResp = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: { Authorization: bearer, 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'Embedded POC', type: 1 })
    });

    const mText = await mResp.text();
    if (!mResp.ok) {
      console.error('Create meeting error:', mResp.status, mText);
      return res.status(mResp.status).send(mText);
    }

    const m = JSON.parse(mText);
    res.json({ meetingNumber: m.id, password: m.password || m.passcode || '' });
  } catch (e) {
    console.error('Instant meeting route exception:', e);
    res.status(e.status || 500).json({ error: e.message });
  }
});

/**
 * POST /zoom/meetings/end
 */
router.post('/zoom/meetings/end', async (req, res) => {
  try {
    const meetingNumber = req.body?.meetingNumber;
    if (!meetingNumber) return res.status(400).json({ error: 'Missing meetingNumber' });

    const bearer = await getZoomBearer(req, {
      sessionMessage: 'Not authorized to end meeting'
    });

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingNumber}/status`, {
      method: 'PUT',
      headers: { Authorization: bearer, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end' })
    });

    const txt = await response.text();
    if (!response.ok) return res.status(response.status).send(txt || 'Failed to end meeting');

    res.json({ ok: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

/**
 * GET /zoom/meetings/:meetingId
 * Returns meeting details (password/passcode, join links, etc.) for the current user.
 */
router.get('/zoom/meetings/:meetingId', async (req, res) => {
  try {
    const meetingId = req.params.meetingId;
    if (!meetingId) return res.status(400).json({ error: 'Missing meetingId' });

    const bearer = await getZoomBearer(req, {
      sessionMessage: 'Log in to Zoom before fetching meeting details.'
    });

    const mResp = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: { Authorization: bearer }
    });

    const mText = await mResp.text();
    if (!mResp.ok) {
      console.error('Fetch meeting detail error:', mResp.status, mText);
      return res.status(mResp.status).send(mText || 'Failed to retrieve meeting');
    }

    res.type('application/json').send(mText);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

export default router;

import { StyledMeetingList } from '../styles';

const formatTopic = (topic) => topic || 'Untitled Meeting';

const getMeetingLink = (meeting) => meeting.join_url || (meeting.id ? `https://zoom.us/j/${meeting.id}` : '#');

const MeetingList = ({ meetings, onSelect }) => {
  if (!meetings || !meetings.length) return null;

  return (
    <StyledMeetingList>
      {meetings.map((meeting, i) => (
        <li className="meeting__item" key={i}>
          <div className="meeting__item__info">
            <span className="meeting__item__topic">{formatTopic(meeting.topic)}</span>
            <a
              className="meeting__item__id"
              href={getMeetingLink(meeting)}
              target="_blank"
              rel="noreferrer"
            >
              {meeting.id}
            </a>
          </div>
          <div className="meeting__item__meta">
            <span>{meeting.start_time || 'Start time TBD'}</span>
            {onSelect && (
              <button type="button" className="meeting__item__action" onClick={() => onSelect(meeting)}>
                Start
              </button>
            )}
          </div>
        </li>
      ))}
    </StyledMeetingList>
  );
};

export default MeetingList;

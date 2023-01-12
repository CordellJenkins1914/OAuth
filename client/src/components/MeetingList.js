import { StyledMeetingList } from '../styles';

const MeetingList = ({ meetings }) => (
  <>
    {meetings && meetings.length ? (
      <StyledMeetingList>
        {meetings.map((meeting, i) => (
          <li className="meeting__item" key={i}>
            <div className="meeting__item__title-group">
              <div className="meeting__item__id-topic">
                <div className="meeting__item__topic">
                  {meeting.topic}
                </div>
                <div className="meeting__item__id">
                  {meeting.id}
                </div>
              </div>
            </div>
            <div className="meeting__item__start_time overflow-ellipsis">
              Start Time:  {meeting.start_time}
            </div>
          </li>
        ))}
      </StyledMeetingList>
    ) : (
      <p className="empty-notice">No Meetings available</p>
    )}
  </>
);

export default MeetingList;
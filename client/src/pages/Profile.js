import { useState, useEffect} from 'react';
import { catchErrors } from '../utils';
import { accessToken, getCurrentUserProfile, getMeetingList } from '../zoom';
import { StyledHeader } from '../styles';
import { SectionWrapper,  MeetingList } from '../components';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [type, setType] = useState(null);
    const [userMeetingList, setMeetingList] = useState(null);
    useEffect(() => {
        if(accessToken){
            const fetchData = async () => {
            const { data } = await getCurrentUserProfile();
            setProfile(data);
            switch(data.type) {
                case 1:
                    setType("Basic");
                break;
                case 2:
                    setType("Licensed");
                break;
                case 3:
                    setType("On-prem");
                    break
                default:
                    setType("None");
            }
            const response = await getMeetingList();
            setMeetingList(response.data.meetings);
            console.log(response);
        };
        catchErrors(fetchData());
    }
  }, []);

  return (
    <>
      {profile && (
        <>
          <StyledHeader type="user">
            <div className="header__inner">
              {profile.pic_url && (
                <img className="header__img" src={profile.pic_url} alt="Avatar"/>
              )}
              <div>
                <div className="header__overline">Profile</div>
                <h1 className="header__name">{profile.first_name}</h1>
                <p className="header__meta">
                  <span>
                    {type}
                  </span>
                </p>
              </div>
            </div>
          </StyledHeader>
          {userMeetingList && (
            <main>
              <SectionWrapper title="User's Meeting List" seeAllLink="/meetings">
                <MeetingList meetings={userMeetingList} />
              </SectionWrapper>
            </main>
          )}
        </>
      )}
    </>
  )
};

export default Profile;
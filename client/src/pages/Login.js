import styled from 'styled-components/macro';

const StyledLoginContainer = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: radial-gradient(circle at top, #1d4ed8, #0f172a 55%, #050815);
  position: relative;
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    inset: 10% auto auto -120px;
    width: 420px;
    height: 420px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.7), rgba(14, 165, 233, 0.5));
    filter: blur(60px);
    opacity: 0.6;
  }
`;

const LoginCard = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 540px;
  border-radius: 32px;
  padding: 48px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 40px 80px rgba(2, 6, 23, 0.6);
  color: #f8fafc;
  text-align: left;

  h1 {
    font-size: clamp(2rem, 4vw, 3.2rem);
    margin-bottom: 12px;
  }

  .eyebrow {
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    font-weight: 700;
    margin-bottom: 16px;
    color: rgba(248, 250, 252, 0.65);
  }

  p {
    color: rgba(248, 250, 252, 0.75);
    font-size: 1rem;
    line-height: 1.5;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 24px 0 32px;

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      font-weight: 600;
    }

    span {
      width: 32px;
      height: 32px;
      border-radius: 11px;
      background: rgba(59, 130, 246, 0.15);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
    }
  }
`;

const StyledLoginButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-image: linear-gradient(120deg, #3b82f6, #6366f1);
  color: var(--white);
  border-radius: 999px;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px 28px;
  border: none;
  text-transform: none;

  &:hover,
  &:focus {
    text-decoration: none;
    filter: brightness(1.05);
  }
`;

const SubtleButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 999px;
  font-weight: 600;
  border: 1px solid rgba(248, 250, 252, 0.3);
  color: rgba(248, 250, 252, 0.8);

  &:hover,
  &:focus {
    text-decoration: none;
    border-color: rgba(248, 250, 252, 0.6);
    color: #fff;
  }
`;

const LoginActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
`;

const Login = () => (
  <StyledLoginContainer>
    <LoginCard>
      <p className="eyebrow">Zoom Toolkit</p>
      <h1>Host crystal-clear meetings in seconds.</h1>
      <p>
        Authenticate with Zoom to launch instant sessions, embed the Meeting SDK, and keep an eye on
        upcoming calls all from a single streamlined dashboard.
      </p>
      <ul>
        <li><span>01</span>Instant meeting launcher</li>
        <li><span>02</span>Embedded client preview</li>
        <li><span>03</span>Upcoming schedule at a glance</li>
      </ul>
      <LoginActions>
        <StyledLoginButton href="http://localhost:8888/login">Connect with Zoom</StyledLoginButton>
        <SubtleButton href="https://developers.zoom.us/docs/meeting-sdk/" target="_blank" rel="noreferrer">
          Learn more
        </SubtleButton>
      </LoginActions>
    </LoginCard>
  </StyledLoginContainer>
);

export default Login;

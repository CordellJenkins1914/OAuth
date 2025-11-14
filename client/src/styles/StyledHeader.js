import styled from 'styled-components/macro';

const StyledHeader = styled.header`
  width: 100%;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 64, 175, 0.8));
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    inset: auto -120px -160px auto;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.6), transparent 70%);
    opacity: 0.6;
  }

  .header__inner {
    width: 100%;
    max-width: var(--site-max-width);
    margin: 0 auto;
    padding: var(--spacing-xxl) var(--spacing-md) var(--spacing-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
    color: #f8fafc;

    @media (min-width: 768px) {
      padding: 80px var(--spacing-xxl) 64px;
    }
  }

  img.header__img {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 20px 40px rgba(2, 6, 23, 0.4);
    border: 4px solid rgba(255, 255, 255, 0.2);

    @media (min-width: 768px) {
      width: 180px;
      height: 180px;
    }
  }

  .header__content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .header__overline {
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(248, 250, 252, 0.6);
  }

  h1.header__name {
    font-size: clamp(2.5rem, 8vw, 4.8rem);
    font-weight: 800;
    margin: 0;
  }

  .header__meta {
    font-size: 1rem;
    color: rgba(248, 250, 252, 0.8);
  }
`;

export default StyledHeader;

import styled from 'styled-components/macro';

const StyledSection = styled.section`
  &:first-of-type {
    .section__inner {
      padding-top: 0;
    }
  }

  .section__inner_right {
    width: 100%;
    max-width: var(--site-max-width);
    margin: 0 auto;
    padding: 60px var(--spacing-md) 80px;

    @media (min-width: 768px) {
      padding: 80px var(--spacing-xxl) 100px;
    }
  }

  .section__top {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    margin-bottom: var(--spacing-xl);
  }

  .section__heading {
    display: flex;
    margin: 0;
    font-size: var(--fz-xxl);
  }

  .section__breadcrumb {
    display: flex;
    color: var(--light-grey);

    &::after {
      content: '/';
      display: block;
      margin: 0 var(--spacing-sm);
    }

    a {
      &:hover,
      &:focus {
        color: var(--white);
      }
    }
  }

  .section__see-all {
    display: flex;
    align-items: flex-end;
    text-transform: uppercase;
    color: var(--light-grey);
    font-size: var(--fz-xxs);
    font-weight: 700;
    letter-spacing: 0.1em;
    padding-bottom: 2px;
  }
`;

export default StyledSection;

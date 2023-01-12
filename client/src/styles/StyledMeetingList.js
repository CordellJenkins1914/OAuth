import styled from 'styled-components/macro';

const StyledMeetingList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  .meeting__item {
    display: grid;
    align-items: center;
    grid-template-columns: 20px 10fr;
    grid-gap: var(--spacing-md);
    padding: var(--spacing-xs);
    background-color: var(--light-grey);
    color: var(--blue);
    font-size: var(--fz-sm);
    border-radius: var(--border-radius-pill);
    transition: background-color 0.3s ease;
    cursor: default;
    border-style: outset;

    @media (min-width: 768px) {
      grid-template-columns: 20px 4fr 2fr minmax(60px, 1fr);
      padding: var(--spacing-xs) var(--spacing-sm);
    }

    &:hover,
    &:focus {
      background-color: var(--dark-grey);
    }
  }

  .meeting__item__title-group {
    display: flex;
    align-items: stretch;
  }

  .meeting__item__id {
    position: relative;
    color: var(--blue);
    font-size: var(--fz-md);
  }
  .meeting__item__topic {
    position: relative;
    color: var(--blue);
    font-size: var(--fz-md);
  }
  .meeting__item__start_time {
    position: relative;
    display: flex;
    left: 90%;
    @media (min-width: 768px) {
      display: block;
      white-space: nowrap;
    }
  }
`;

export default StyledMeetingList;
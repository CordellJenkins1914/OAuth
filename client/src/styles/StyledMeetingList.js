import styled from 'styled-components/macro';

const StyledMeetingList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  .meeting__item {
    padding: 10px 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.4);
    font-size: var(--fz-sm);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .meeting__item:last-child {
    border-bottom: none;
  }

  .meeting__item__info {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }

  .meeting__item__topic {
    font-weight: 600;
    color: #0f172a;
  }

  .meeting__item__id {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }

  .meeting__item__id:hover,
  .meeting__item__id:focus {
    text-decoration: underline;
  }

  .meeting__item__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: #475569;
    gap: 12px;
  }

  .meeting__item__action {
    padding: 6px 14px;
    border-radius: 999px;
    background-image: linear-gradient(120deg, #2563eb, #7c3aed);
    color: #fff;
    border: none;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
  }
`;

export default StyledMeetingList;

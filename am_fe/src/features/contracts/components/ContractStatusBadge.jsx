import styles from './ContractStatusBadge.module.css';
import { CONTRACT_STATUS, CONTRACT_STATUS_DISPLAY } from '../constants/contractConstants';

export default function ContractStatusBadge({ status }) {
  const displayLabel = CONTRACT_STATUS_DISPLAY[status] || status;

  let modifierClass = '';
  if (status === CONTRACT_STATUS.ACTIVE) {
    modifierClass = styles.statusBadgeActive;
  } else if (status === CONTRACT_STATUS.EXPIRED) {
    modifierClass = styles.statusBadgeExpired;
  } else if (status === CONTRACT_STATUS.TERMINATED) {
    modifierClass = styles.statusBadgeTerminated;
  }

  return (
    <span className={`${styles.statusBadge} ${modifierClass}`}>
      {displayLabel}
    </span>
  );
}

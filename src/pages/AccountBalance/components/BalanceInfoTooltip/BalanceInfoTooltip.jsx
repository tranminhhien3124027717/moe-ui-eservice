import React from 'react';
import { Popover } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons'; 
import styles from './BalanceInfoTooltip.module.scss';

const BalanceInfoTooltip = () => {
  const content = (
    <div className={styles.tooltipContainer}>
      <ul className={styles.infoList}>
        <li>Your balance is automatically topped up based on <strong>government schemes</strong>.</li>
        <li>Funds can be used to pay for <strong>approved education courses</strong>.</li>
        <li>Unused balance will be forfeited when account closes at <strong>age 30</strong>.</li>
        <li>Balance <strong>cannot</strong> be withdrawn as cash.</li>
      </ul>
    </div>
  );

  return (
    <Popover 
      title={<span style={{ fontWeight: 600 }}>About Your Balance</span>}
      content={content} 
      trigger="hover" 
      placement="bottomLeft"
      overlayClassName={styles.customPopoverOverlay} 
    >
      <ExclamationCircleFilled className={styles.infoIcon} />
    </Popover>
  );
};

export default BalanceInfoTooltip;
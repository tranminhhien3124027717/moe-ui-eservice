import React from 'react';
import { ExclamationCircleOutlined, WalletOutlined, ReadOutlined } from '@ant-design/icons';
import styles from '../CourseManagement.module.scss';
import { checkIsEducationAccount } from '../../../utils/authHelpers';
import { formatCurrency } from '../../../utils/formatters';

const StatCards = ({ outstandingFees = 0, balance = 0, enrolledCount = 0 }) => {
  const isEdu = checkIsEducationAccount();

  return (
    <div className={styles.statsRow}>
      
      {/* Card 1: Outstanding  */}
      <div className={`${styles.statCard} ${styles.cardOrange}`}>
         <div className={`${styles.iconWrapper} ${styles.orange}`}>
            <ExclamationCircleOutlined />
         </div>
         <div className={styles.statInfo}>
            <span className={styles.label}>Outstanding</span>
            <span className={styles.value}>
                {formatCurrency(outstandingFees)}
            </span>
         </div>
      </div>

      {/* Card 2: Balance  */}
      {isEdu && (
          <div className={`${styles.statCard} ${styles.cardTeal}`}>
             <div className={`${styles.iconWrapper} ${styles.teal}`}>
                <WalletOutlined />
             </div>
             <div className={styles.statInfo}>
                <span className={styles.label}>Account Balance</span>
                <span className={styles.value}>
                    {formatCurrency(balance)}
                </span>
             </div>
          </div>
      )}

      {/* Card 3: Enrolled  */}
      <div className={`${styles.statCard} ${styles.cardBlue}`}>
         <div className={`${styles.iconWrapper} ${styles.blue}`}>
            <ReadOutlined />
         </div>
         <div className={styles.statInfo}>
            <span className={styles.label}>Enrolled Courses</span>
            <span className={styles.value}>{enrolledCount}</span>
         </div>
      </div>
    </div>
  );
};

export default StatCards;
import React from 'react';
import { DollarOutlined, DollarCircleOutlined } from '@ant-design/icons';
import styles from '../CourseDetails.module.scss';

const SummaryStats = ({ outstanding, totalFee }) => {
  return (
    <div className={styles.summaryRow}>
      {/* Card Outstanding */}
      <div className={styles.summaryCard}>
        <div className={`${styles.iconBox} ${styles.yellow}`}>
          <DollarOutlined />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Outstanding</span>
          <span className={`${styles.value} ${styles.orange}`}>{outstanding}</span>
        </div>
      </div>
      {/* Card Total Fee */}
      <div className={styles.summaryCard}>
        <div className={`${styles.iconBox} ${styles.teal}`}>
          <DollarCircleOutlined />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Total Fee</span>
          <span className={styles.value}>{totalFee}</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
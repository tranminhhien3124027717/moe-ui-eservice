import React from 'react';
import { Typography } from 'antd';
import styles from '../Dashboard.module.scss';
import { checkIsEducationAccount } from '../../../utils/authHelpers';

const { Title } = Typography;

const WelcomeBanner = ({ userName = "Eric" }) => {
  const isEducationAccount = checkIsEducationAccount();
  const accountType = isEducationAccount ? 'education' : 'student';

  return (
    <div className={styles.welcomeBanner}>
      <Title level={2} style={{ color: '#fff', margin: '0 0 8px 0', fontWeight: 800 }}>
        Welcome back, {userName}!
      </Title>
      <span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '16px' }}>
        Manage your {accountType} account and course payments
      </span>
    </div>
  );
};

export default WelcomeBanner;
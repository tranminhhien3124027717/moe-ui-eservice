import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import styles from '../CourseDetails.module.scss'; 

const HeaderNav = ({ courseName, provider, status }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.headerNav}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>
        <ArrowLeftOutlined />
      </button>
      <div className={styles.headerContent}>
        <div className={styles.titleInfo}>
          <h1>{courseName}</h1>
          <p>{provider}</p>
        </div>
      </div>
    </div>
  );
};

export default HeaderNav;
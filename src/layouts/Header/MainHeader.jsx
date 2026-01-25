import React from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom'; 
import EduLogo from '../../assets/icon/EduLogo.jsx';
import styles from './MainHeader.module.scss';

const { Header } = Layout;

const MainHeader = ({ toggleMobile }) => {
  const navigate = useNavigate(); 

  return (
    <Header className={styles.sharedHeader}>
      <div className={styles.headerLeft}>
        {toggleMobile}
        <div 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer' 
          }}
        >
          <div className={styles.logoContainer}>
            <EduLogo />
          </div>
          <div className={styles.brandInfo}>
            <h1>EduCredit</h1>
            <span>Education Account System</span>
          </div>
        </div>
        
      </div>     
    </Header>
  );
};
export default MainHeader;
import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { USER_MENU } from '../../utils/menuItems';
import { LogoutOutlined } from '@ant-design/icons';
import styles from './UserSidebar.module.scss';


import { checkIsEducationAccount } from '../../utils/authHelpers';

const UserSidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate(); 

  // --- 1. Lấy thông tin User ---
  const getUserFromLocalStorage = () => {
    try {
      const userDataStr = localStorage.getItem('user_data');
      if (userDataStr) {
        return JSON.parse(userDataStr);
      }
    } catch (error) {
      console.error('Error parsing user_data from localStorage:', error);
    }
    return null;
  };

  const userData = getUserFromLocalStorage();
  const currentUser = { name: userData?.fullName || 'User', nric: userData?.nric || '-' };

  // --- 2. Xử lý Logic Menu ---
  const isEduAccount = checkIsEducationAccount();

  // Lọc menu trước khi map
  const menuItems = USER_MENU.filter(item => {
    if (item.key === '/balance' && !isEduAccount) {
      return false; 
    }
    return true; // Các mục khác hiển thị bình thường
  }).map(i => ({
    ...i, 
    label: <Link to={i.key} onClick={onClose}>{i.label}</Link>
  }));

  // --- 3. Logout ---
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user_data');
    
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <div className={styles.userSidebarContainer}>
      {/* 1. Profile */}
      <div className={styles.profileSection}>
         <div className={styles.profileCard}>
            <div className={styles.avatar}>
               {currentUser.name ? currentUser.name.substring(0, 1).toUpperCase() : 'U'}
            </div>
            <div className={styles.info}>
               <span className={styles.name}>{currentUser.name}</span>
               <span className={styles.role}>{currentUser.nric}</span>
            </div>
         </div>
      </div>

      {/* 2. Menu */}
      <div className={styles.menuWrapper}>
        <Menu 
           mode="inline"
           selectedKeys={[location.pathname]}
           items={menuItems}
           className={styles.userMenu}
        />
      </div>

      {/* 3. Footer Section - LOGOUT BUTTON */}
      <div className={styles.footerSection}>
        <div className={styles.logoutBtn} onClick={handleLogout}>
           <LogoutOutlined className={styles.icon} />
           <span className={styles.text}>Log out</span>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;
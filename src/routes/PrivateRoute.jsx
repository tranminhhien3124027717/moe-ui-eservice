import React from 'react';
import { Navigate, useLocation } from 'react-router-dom'; 

const PrivateRoute = ({ children }) => {
  const location = useLocation(); 
  
  // 1. Kiểm tra đăng nhập cơ bản
  const isAuthenticated = localStorage.getItem('accessToken');


  let isEdu = false;
  try {
    const userDataStr = localStorage.getItem('user_data');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      isEdu = userData.isEducationAccount === true; 
    }
  } catch (error) {
    console.error("Error parsing user data", error);
    isEdu = false;
  }

  // Nếu chưa đăng nhập -> Đá về Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Logic chặn trang Account Balance
  // Nếu đang cố vào trang balance MÀ không phải tài khoản Edu -> Đá về Dashboard
  if (location.pathname === '/balance' && !isEdu) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
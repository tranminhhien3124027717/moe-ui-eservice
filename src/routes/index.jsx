import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import IMG2 from '../assets/images/IMG2.jpg';

// Layouts & Guards
import MainLayout from '../layouts/MainLayout.jsx';
import PrivateRoute from './PrivateRoute.jsx'; 

// Pages
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import CourseManagement from '../pages/CourseManagement/CourseManagement.jsx';
import CourseDetails from '../pages/CourseDetails/CourseDetails.jsx';
import UserProfile from '../pages/MyProfile/UserProfile.jsx';
import IntroducePage from '../pages/Introduce/IntroducePage.jsx';
import LoginPage from '../pages/Login/LoginPage.jsx'; 
import AccountBalance from '../pages/AccountBalance/AccountBalance.jsx';
import PaymentResultPage from '../pages/PaymentResult/PaymentResult.jsx';

export const router = createBrowserRouter([
  // --- 1. PUBLIC ROUTES  ---
  {
    path: '/',
    element: <IntroducePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },

  // --- 2. PROTECTED ROUTES  ---
  {
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: 'dashboard', 
        element: <Dashboard />
      },
      {
        path: 'balance',
        element: <AccountBalance />
      },
      {
        path: 'courses',
        element: <CourseManagement />
      },
      {
        path: 'course-details/:id',
        element: <CourseDetails />
      },
      // [MỚI] Route nhận kết quả thanh toán từ Stripe/VNPay
      {
        path: 'payment-result',
        element: <PaymentResultPage />
      },
      {
        path: 'profile',
        element: <UserProfile />
      }
    ]
  },

  // --- 3. FALLBACK ---
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);
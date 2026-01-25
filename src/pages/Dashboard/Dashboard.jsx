import React, { useState, useEffect } from 'react';
import { Row, Col, Button, message, Spin } from 'antd';
import { WalletFilled, ReadFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.scss';

import WelcomeBanner from './components/WelcomeBanner';
import StatsCard from './components/StatsCard';
import CoursesTable from './components/CoursesTable';

import accountService from '../../services/accountService';
import { checkIsEducationAccount } from '../../utils/authHelpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Khởi tạo state với giá trị mặc định là 0 hoặc rỗng
  const [balance, setBalance] = useState(0);
  const [outstandingFees, setOutstandingFees] = useState({ amount: 0, count: 0 });
  const [activeCourses, setActiveCourses] = useState([]);
  const [totalActiveCourses, setTotalActiveCourses] = useState(0);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Lấy user data từ localStorage
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

  const currentUser = getUserFromLocalStorage();
  const userName = currentUser?.fullName || '-'; 
  const isEducationAccount = checkIsEducationAccount();

  // Fetch all data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await accountService.getMyProfile();
      setProfileData(response.data || response);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await accountService.getDashboardData();
      
      const dashboardData = response.data || response;

      if (dashboardData) {
        const { balance, activeCoursesCount, outstandingFees, outstadingCount, enrollCourses } = dashboardData;

        // Set balance
        setBalance(balance || 0);

        // Set outstanding fees
        setOutstandingFees({
          amount: outstandingFees || 0,
          count: outstadingCount || 0
        });

        // Transform courses data
        if (enrollCourses && Array.isArray(enrollCourses)) {
          const transformedCourses = enrollCourses.map((course, index) => {
            try {
              return {
                key: index,
                id: course.enrollmentId || course.id,
                courseName: course.courseName,
                university: course.providerName,
                paymentType: course.paymentType,
                billingCycle: course.billingCycle,
                enrolledDate: course.enrollDate || '-',
                billingDate: course.billingDate || '-',
                status: course.paymentStatus
              };
            } catch (e) {
              return null;
            }
          }).filter(Boolean);
          
          setActiveCourses(transformedCourses);
          setTotalActiveCourses(activeCoursesCount || enrollCourses.length);
        } else {
            setActiveCourses([]);
            setTotalActiveCourses(0);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Display loading spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large">
          <div style={{ padding: '50px' }}>Loading dashboard...</div>
        </Spin>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>

      <WelcomeBanner userName={userName} />

      <div className={styles.statsSection}>
        <Row gutter={[24, 24]}>
          {isEducationAccount && (
            <Col xs={24} sm={24} lg={8}>
              <StatsCard
                title="Account Balance"
                value={balance}
                subText="Available Credits"
                icon={<WalletFilled />}
                iconColorClass={styles.iconTeal}
                valueColorClass={styles.highlight}
                isCurrency={true}
              />
            </Col>
          )}
          <Col xs={24} sm={24} lg={isEducationAccount ? 8 : 12}>
            <StatsCard
              title="Active Courses"
              value={totalActiveCourses}
              subText="Currently enrolled"
              icon={<ReadFilled />}
              iconColorClass={styles.iconBlue}
            />
          </Col>
          <Col xs={24} sm={24} lg={isEducationAccount ? 8 : 12}>
            <StatsCard
              title="Outstanding Fees"
              value={outstandingFees.amount}
              subText={`${outstandingFees.count} pending charges`}
              icon={<ExclamationCircleFilled />}
              variant="action"
              iconColorClass={styles.iconOrange}
              valueColorClass={styles.warning}
              isCurrency={true}
            >
              {outstandingFees.amount > 0 && (
                <Button 
                  type="primary" 
                  className={styles.payBtn} 
                  block
                  onClick={() => navigate('/courses')}
                >
                  Pay Now
                </Button>
              )}
            </StatsCard>
          </Col>
        </Row>
      </div>

      <CoursesTable 
        data={activeCourses} 
        loading={coursesLoading}
      />

    </div>
  );
};

export default Dashboard;
import React from 'react';
import { Card, Row, Col, Button } from 'antd';
import { UserOutlined, SyncOutlined } from '@ant-design/icons';
import styles from '../UserProfile.module.scss';
import StatusTag from '../../../components/common/StatusTag/StatusTag'; 

const PersonalInfoSection = ({ profileData, onSyncSingPass, syncing }) => {
  
  // --- HELPER FUNCTIONS ---

  // 1. Format ngày tháng (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Sử dụng locale en-GB để có định dạng ngày/tháng/năm
      return date.toLocaleDateString('en-GB'); 
    } catch (e) {
      return dateString;
    }
  };

  // 2. Format ngày tháng kèm tính tuổi
  const formatDateWithAge = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const m = today.getMonth() - date.getMonth();
      // Điều chỉnh tuổi nếu chưa đến sinh nhật trong năm nay
      if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--;
      }
      return `${formatDate(dateString)} (${age} years old)`;
    } catch (e) {
      return '-';
    }
  };

  // 3. Format chuỗi CamelCase thành chữ thường có dấu cách (VD: SingaporeCitizen -> Singapore Citizen)
  const formatStatus = (status) => {
    if (!status) return '-';
    return status.replace(/([A-Z])/g, ' $1').trim();
  };

  // 4. Format trạng thái đi học hiển thị cho đẹp
  const formatSchoolingStatus = (status) => {
    if (!status) return '-';
    if (status === 'InSchool') return 'In School';
    if (status === 'NotInSchool') return 'Not In School';
    return status;
  };

  return (
    <Card className={styles.profileCard} variant='borderless'>
      {/* HEADER CARD */}
      <div className={`${styles.cardHeader} ${styles.isBordered}`}>
        <div className={styles.headerLeft}>
          <div className={styles.iconContainer} style={{ backgroundColor: '#f3f4f6' }}>
            <UserOutlined style={{ color: '#6b7280' }} />
          </div>
          <div className={styles.headerContent}>
            <h3>Personal Information</h3>
            <span>These details cannot be changed online</span>
          </div>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className={styles.headerActions}>
          <Button 
            className={styles.btnSync}
            icon={<SyncOutlined spin={syncing} />} 
            onClick={onSyncSingPass}               
            loading={syncing}                      
            disabled={syncing}                    
          >
            Sync SingPass
          </Button>
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className={styles.cardContent}>
        <Row gutter={[48, 24]}>
          <InfoItem 
            label="Full Name" 
            value={profileData?.fullName || '-'} 
          />
          <InfoItem 
            label="NRIC/FIN" 
            value={profileData?.nric || '-'} 
          />
          <InfoItem 
            label="Date of Birth" 
            value={formatDateWithAge(profileData?.dateOfBirth)} 
          />
          <InfoItem 
            label="Account Created" 
            value={formatDate(profileData?.accountCreated)} 
          />
          
          {/* Schooling Status dùng StatusTag */}
          <Col xs={24} md={12}>
            <div className={styles.infoField}>
              <label>Schooling Status</label>
              <div>
                <StatusTag status={formatSchoolingStatus(profileData?.schoolingStatus)} />
              </div>
            </div>
          </Col>

          <InfoItem 
            label="Education Level" 
            value={formatStatus(profileData?.educationLevel)} 
          />
          <InfoItem 
            label="Residential Status" 
            value={formatStatus(profileData?.residentialStatus)} 
          />
        </Row>
      </div>
    </Card>
  );
};


const InfoItem = ({ label, value }) => (
  <Col xs={24} md={12}>
    <div className={styles.infoField}>
      <label>{label}</label>
      <div className={`${styles.value} ${styles.valueBold}`}>{value}</div>
    </div>
  </Col>
);

export default PersonalInfoSection;
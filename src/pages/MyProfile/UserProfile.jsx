import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import authService from '../../services/authService';
import accountService from '../../services/accountService';
import PersonalInfoSection from './components/PersonalInfoSection.jsx';
import ContactAddressSection from './components/ContactAddressSection.jsx';
import styles from './UserProfile.module.scss';

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await accountService.getMyProfile();
      const data = response.data || response;
      setProfileData(data);
    } catch (error) {
      message.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      const updateData = {
        email: values.email,
        contactNumber: values.phone,
        registeredAddress: values.registeredAddress,
        mailingAddress: values.mailingAddress
      };

      await accountService.updateProfile(updateData);
      message.success('Profile updated successfully!');

      await fetchProfile();
      return true;
    } catch (error) {
      message.error('Failed to update profile');
      return false;
    }
  };


  const handleSyncFromSingPass = async () => {
    try {
      setSyncing(true);

      // Gọi API sync từ authService
      await authService.syncSingpassData();

      message.success('Profile data synced from SingPass successfully!');

      // Refresh lại data sau khi sync thành công
      await fetchProfile();

    } catch (error) {
      const status = error.response?.status;
      const errorCode = error.response?.data?.errorCode;
      const errorMessage = error.response?.data?.errorMessage;


      if (status === 404 && errorCode === 'NOT_FOUND') {
        message.error('No resident record found for this account.');
      } else if (status === 404) {
        message.error('Sync service is currently unavailable.');
      } else if (status === 401) {
        message.error('Session expired. Please login again.');
      } else {
        message.error(errorMessage || 'Failed to sync profile from SingPass');
      }
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large">
          <div style={{ padding: '50px' }}>Loading profile...</div>
        </Spin>
      </div>
    );
  }

  return (
    <div className={styles.userProfilePage}>
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1>My Profile</h1>
          <p>View and update your personal information</p>
        </div>


        <PersonalInfoSection
          profileData={profileData}
          onSyncSingPass={handleSyncFromSingPass}
          syncing={syncing}
        />

        <ContactAddressSection
          profileData={profileData}
          onUpdate={handleUpdateProfile}
          syncing={syncing}
        />
      </div>
    </div>
  );
};

export default UserProfile;
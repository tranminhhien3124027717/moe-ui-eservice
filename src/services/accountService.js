import axiosClient from './axiosClient';

const accountService = {
  getMyProfile() {
    return axiosClient.get('/account-holders/me');
  },

  updateProfile(data) {
    return axiosClient.put('/account-holders/me', data);
  },

  getActiveCourses(accountHolderId) {
    return axiosClient.get(`/account-holders/${accountHolderId}/active-courses`);
  },


  getBalance(accountId) {
    return axiosClient.get(`/education-accounts/${accountId}/balance`);
  },


  getOutstandingFees(accountId) {
    return axiosClient.get(`/education-accounts/${accountId}/outstanding-fees`);
  },

 
  getDashboardData() {
    return axiosClient.get('/dashboard');
  }
};

export default accountService;
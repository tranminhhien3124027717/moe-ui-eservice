import axiosClient from './axiosClient';

const educationService = {
  // Lấy số dư tài khoản
  getBalance(accountId) {
    return axiosClient.get(`/education-accounts/${accountId}/balance`);
  },

  // Lấy phí chưa thanh toán
  getOutstandingFees(accountId) {
    return axiosClient.get(`/education-accounts/${accountId}/outstanding-fees`);
  }
};

export default educationService;
import axiosClient from './axiosClient';

const authService = {
  login(data) {
    return axiosClient.post('/auth/login', data);
  },

  getProfile() {
    return axiosClient.get('/auth/me');
  },


  syncSingpassData() {
    return axiosClient.put('/account-holders/me/sync');
  }
};

export default authService;
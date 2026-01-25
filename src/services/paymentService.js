import axiosClient from './axiosClient';

const paymentService = {
  // 1. Lấy chi tiết hóa đơn
  getInvoiceDetails(invoiceId) {
    return axiosClient.get('/payments/invoice-details', {
      params: { invoiceId }
    });
  },

  // 2. API Tạo thanh toán
  createPayment(data) {
    // data structure: 
    // { invoiceId, isUseBalance, amountFromBalance, isUseExternal, paymentMethod }
    return axiosClient.post('/payments/create', data);
  },

  // 3. API Check trạng thái hóa đơn (Polling)
  // Dùng để kiểm tra trạng thái thanh toán mỗi 3 giây
  checkInvoiceStatus(invoiceId) {
    return axiosClient.get('/payments/check-invoice-status', {
      params: { invoiceId }
    });
  }
};

export default paymentService;
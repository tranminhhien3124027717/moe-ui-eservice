import axiosClient from './axiosClient';

/**
 * =================================================================
 * API CHO TRANG QUẢN LÝ BALANCE (ACCOUNT BALANCE MANAGEMENT)
 * =================================================================
 */

// 1. Lấy thông tin balance hiện tại
// GET /api/v1/account-holders/balance
export const getAccountBalance = () => {
  return axiosClient.get('/account-holders/balance');
};

// 2. Lấy lịch sử giao dịch của account (Có phân trang & filter)
// GET /api/v1/account-holders/balance/transaction-history
// Các tham số filter (tùy chọn):
//   - page: Số trang (từ 1)
//   - pageSize: Số item mỗi trang
//   - type: 0 | 1 (loại giao dịch)
//   - dateFilter: 0 | 1 | 2 | 3 | 4 | 5 (bộ lọc ngày)
//   - amountRange: 0 | 1 | 2 | 3 | 4 | 5 (bộ lọc khoảng tiền)
export const getBalanceTransactionHistory = (filters = {}) => {
  // 1. Khai báo các biến (Đã XÓA description)
  const {
    page = 1,
    pageSize = 10,
    type = null,
    dateFilter = null,
    amountRange = null,
    searchTerm = null // Chỉ nhận searchTerm từ UI
  } = filters;

  const params = {
    pageNumber: page,
    pageSize: pageSize
  };

  // 2. Map các filter cơ bản
  if (type !== null && type !== undefined) params.type = type;
  if (dateFilter !== null && dateFilter !== undefined) params.dateFilter = dateFilter;
  if (amountRange !== null && amountRange !== undefined) params.amountRange = amountRange;

  
  if (searchTerm) {

      params.searchTerm = searchTerm;
  }

  return axiosClient.get('/account-holders/balance/transaction-history', { params });
};

// 3. Lấy chi tiết một giao dịch cụ thể
// GET /api/v1/education-accounts/{accountId}/transactions/{transactionId}
export const getTransactionDetail = (accountId, transactionId) => {
  return axiosClient.get(`/education-accounts/${accountId}/transactions/${transactionId}`);
};

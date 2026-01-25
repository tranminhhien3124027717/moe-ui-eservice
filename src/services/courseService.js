import axiosClient from './axiosClient';

/**
 * =================================================================
 * 1. API CHO TRANG QUẢN LÝ KHÓA HỌC (COURSE MANAGEMENT DASHBOARD)
 * =================================================================
 */

// 1. Summary (Không phân trang)
export const getCourseSummary = () => {
  return axiosClient.get('/account-holders/courses/summary');
};

// 2. Enrolled Courses (Có phân trang)
export const getEnrolledCourses = (pageNumber = 1, pageSize = 5) => {
  return axiosClient.get('/account-holders/courses/enrolled', {
    params: { pageNumber, pageSize }
  });
};

// 3. Pending Fees (Có phân trang)
export const getPendingFees = (pageNumber = 1, pageSize = 5) => {
  return axiosClient.get('/account-holders/courses/pending-fees', {
    params: { pageNumber, pageSize }
  });
};

// 4. Payment History (Có phân trang)
export const getPaymentHistory = (pageNumber = 1, pageSize = 5) => {
  return axiosClient.get('/account-holders/courses/payment-history', {
    params: { pageNumber, pageSize }
  });
};

/**
 * =================================================================
 * 2. API CHO TRANG CHI TIẾT KHÓA HỌC (COURSE DETAILS)
 * =================================================================
 */

// 1. Lấy thông tin chi tiết khóa học
export const getCourseDetailInfo = (enrollmentId) => {
  return axiosClient.get(`/account-holders/courses/${enrollmentId}/course-information`);
};

// 2. Lấy danh sách phí chưa thanh toán của khóa học này (Có phân trang)
export const getCourseOutstandingFees = (enrollmentId, pageNumber = 1, pageSize = 5) => {
  return axiosClient.get(`/account-holders/courses/${enrollmentId}/outstanding-fees`, {
    params: { pageNumber, pageSize }
  });
};

// 3. Lấy chu kỳ thanh toán sắp tới (Có phân trang)
export const getCourseUpcomingBills = (enrollmentId, pageNumber = 1, pageSize = 5) => {
  return axiosClient.get(`/account-holders/courses/${enrollmentId}/upcoming-billing-cycles`, {
    params: { pageNumber, pageSize }
  });
};

// 4. Lấy lịch sử thanh toán của khóa học này (Có phân trang)
export const getCoursePaymentHistory = (enrollmentId, pageNumber = 1, pageSize = 5) => {
  return axiosClient.get(`/account-holders/courses/${enrollmentId}/payment-history`, {
    params: { pageNumber, pageSize }
  });
};

// Gom tất cả vào object default để tiện import
const courseService = {
    // Dashboard APIs
    getCourseSummary,
    getEnrolledCourses,
    getPendingFees,
    getPaymentHistory,
    
    // Detail APIs
    getCourseDetailInfo,
    getCourseOutstandingFees,
    getCourseUpcomingBills,
    getCoursePaymentHistory
};

export default courseService;
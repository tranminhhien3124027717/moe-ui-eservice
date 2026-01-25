import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import styles from './CourseManagement.module.scss';

// Services
import { 
  getCourseSummary, 
  getEnrolledCourses, 
  getPendingFees, 
  getPaymentHistory 
} from '../../services/courseService';
import { formatCurrency } from '../../utils/formatters';

// Components
import StatCards from './components/StatCards';
import EnrolledTable from './components/EnrolledTable';
import PendingFees from './components/PendingFees';
import PaymentHistory from './components/PaymentHistory';

const CourseManagement = () => {
  // --- 1. STATE ---
  const [summary, setSummary] = useState({ 
    outstandingFees: 0, 
    balance: 0, 
    enrolledCount: 0, 
    loading: true 
  });

  // State quản lý data và pagination cho từng bảng
  const [enrolled, setEnrolled] = useState({ 
    data: [], total: 0, current: 1, pageSize: 5, loading: false 
  });
  
  const [pending, setPending] = useState({ 
    data: [], total: 0, current: 1, pageSize: 5, loading: false 
  });

  const [history, setHistory] = useState({ 
    data: [], total: 0, current: 1, pageSize: 5, loading: false 
  });

  // --- 2. FETCH FUNCTIONS ---

  // A. Fetch Summary
  const fetchSummary = async () => {
    try {
      const res = await getCourseSummary();
      if (res.data) {
        setSummary({ 
           outstandingFees: res.data.outstandingFees || 0, 
           balance: res.data.balance || 0, 
           enrolledCount: res.data.totalEnrolledCourses || 0,
           loading: false 
        });
      }
    } catch (error) { 
      console.error(error); 
      setSummary(prev => ({ ...prev, loading: false }));
    }
  };

  // B. Fetch Enrolled Courses
  const fetchEnrolled = async (page, pageSize) => {
    setEnrolled(prev => ({ ...prev, loading: true }));
    try {
      const res = await getEnrolledCourses(page, pageSize);
      if (res.data && res.data.courses) {
        const { items, totalCount } = res.data.courses;
        
        const mapped = (items || []).map((course) => ({
             id: course.enrollmentId, 
             key: course.enrollmentId,
             courseName: course.courseName,
             university: course.providerName,
             fee: formatCurrency(course.courseFee),
             paymentType: course.billingCycle && course.billingCycle !== '-' ? 'Recurring' : 'One Time',
             billingCycle: course.billingCycle || '—',
             enrolledDate: course.enrolledDate,
             billingDate: course.billingDate,
             nextBillDate: course.billingDate || '—', 
             status: course.paymentStatus,
        }));
        
        setEnrolled({ 
          data: mapped, 
          total: totalCount || 0, 
          current: page, 
          pageSize: pageSize, 
          loading: false 
        });
      } else {
         setEnrolled(prev => ({ ...prev, loading: false, data: [] }));
      }
    } catch (error) {
      setEnrolled(prev => ({ ...prev, loading: false }));
      message.error("Failed to load enrolled courses");
    }
  };

  // C. Fetch Pending Fees
  const fetchPending = async (page, pageSize) => {
    setPending(prev => ({ ...prev, loading: true }));
    try {
      const res = await getPendingFees(page, pageSize);
      if (res.data && res.data.fees) {
        const { items, totalCount } = res.data.fees;

        const mapped = (items || []).map((fee) => ({
            key: fee.invoiceId, 
            invoiceId: fee.invoiceId, 
            id: fee.enrollmentId, // Thêm enrollmentId để navigate nếu cần
            courseName: fee.courseName,
            providerName: fee.providerName,
            amountDue: fee.amountDue,       
            billingCycle: fee.billingCycle || '—', 
            billingDate: fee.billingDate || '—',   
            dueDate: fee.dueDate,
            paymentStatus: fee.paymentStatus 
        }));

        setPending({ 
          data: mapped, 
          total: totalCount || 0, 
          current: page, 
          pageSize: pageSize, 
          loading: false 
        });
      } else {
        setPending(prev => ({ ...prev, loading: false, data: [] }));
      }
    } catch (error) {
      setPending(prev => ({ ...prev, loading: false }));
      message.error("Failed to load pending fees");
    }
  };

  // D. Fetch Payment History
  const fetchHistory = async (page, pageSize) => {
    setHistory(prev => ({ ...prev, loading: true }));
    try {
      const res = await getPaymentHistory(page, pageSize);
      if (res.data && res.data.history) {
        const { items, totalCount } = res.data.history;

        const mapped = (items || []).map((payment, idx) => ({
            id: idx + 1, // Hoặc ID thật từ API nếu có
            key: String(idx + 1),
            courseName: payment.courseName,
            university: payment.providerName,
            amount: formatCurrency(payment.amountPaid),
            cycle: payment.billingCycle,
            paidDate: payment.transactionDate || payment.paymentDate,
            method: payment.paymentMethod
        }));

        setHistory({ 
          data: mapped, 
          total: totalCount || 0, 
          current: page, 
          pageSize: pageSize, 
          loading: false 
        });
      } else {
        setHistory(prev => ({ ...prev, loading: false, data: [] }));
      }
    } catch (error) {
      setHistory(prev => ({ ...prev, loading: false }));
      message.error("Failed to load history");
    }
  };

  // --- 3. INITIAL LOAD ---
  useEffect(() => {
    fetchSummary();
    // Load lần đầu với trang 1 và pageSize mặc định (5)
    fetchEnrolled(1, 5);
    fetchPending(1, 5);
    fetchHistory(1, 5);
  }, []);

  // --- 4. REFRESH FUNCTION ---
  const handleRefresh = () => {
      fetchSummary(); 
      // Refresh giữ nguyên trang hiện tại hoặc về trang 1 tùy logic của bạn (ở đây về trang 1 cho an toàn)
      fetchPending(1, pending.pageSize); 
      fetchHistory(1, history.pageSize); 
  };

  // --- 5. RENDER ---
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2>Your Courses</h2>
        <p>View your enrolled courses and payment history</p>
      </div>

      {/* Stats Cards */}
      <StatCards
        outstandingFees={summary.outstandingFees}
        balance={summary.balance}
        enrolledCount={summary.enrolledCount} 
      />

      {/* 1. Enrolled Table */}
      <EnrolledTable 
          data={enrolled.data}
          loading={enrolled.loading}
          pagination={{
              current: enrolled.current,
              pageSize: enrolled.pageSize,
              total: enrolled.total,
              // Cấu hình pageSize changer
              showSizeChanger: true, 
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              // Hàm onChange nhận cả page và pageSize mới
              onChange: (page, pageSize) => fetchEnrolled(page, pageSize)
          }}
      />

      {/* 2. Pending Fees Table */}
      <PendingFees 
         data={pending.data} 
         loading={pending.loading}
         pagination={{
             current: pending.current,
             pageSize: pending.pageSize,
             total: pending.total,
             showSizeChanger: true,
             pageSizeOptions: ['5', '10', '20'],
             showTotal: (total) => `Total ${total} fees`,
             onChange: (page, pageSize) => fetchPending(page, pageSize)
         }}
         onRefresh={handleRefresh} 
      />

      {/* 3. Payment History Table */}
      <PaymentHistory 
         data={history.data}
         loading={history.loading}
         pagination={{
             current: history.current,
             pageSize: history.pageSize,
             total: history.total,
             showSizeChanger: true,
             pageSizeOptions: ['5', '10', '20', '50'],
             showTotal: (total) => `Total ${total} transactions`,
             onChange: (page, pageSize) => fetchHistory(page, pageSize)
         }}
      />
    </div>
  );
};

export default CourseManagement;
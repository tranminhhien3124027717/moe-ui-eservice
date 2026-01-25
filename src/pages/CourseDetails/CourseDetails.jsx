import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import styles from './CourseDetails.module.scss';

// --- Services ---
import {
  getCourseDetailInfo,
  getCourseOutstandingFees,
  getCourseUpcomingBills,
  getCoursePaymentHistory
} from '../../services/courseService';

// --- Utils ---
import { formatCurrency } from '../../utils/formatters';

// --- Sub-Components ---
import HeaderNav from './components/HeaderNav';
import SummaryStats from './components/SummaryStats';
import CourseInfoGrid from './components/CourseInfoGrid';
import PaymentHistoryTable from './components/PaymentHistoryTable';
import UpcomingBillsList from './components/UpcomingBillsList';
import OutstandingFees from './components/OutstandingFees';

const CourseDetails = () => {
  // Extract enrollment/course ID from URL parameters
  const { id } = useParams();

  /* ==========================================================================
     STATE MANAGEMENT
     ========================================================================== */
  
  const [loading, setLoading] = useState(true);
  const [upcomingLoading, setUpcomingLoading] = useState(false);

  const [courseInfo, setCourseInfo] = useState(null);       
  const [outstandingData, setOutstandingData] = useState([]); 
  const [historyData, setHistoryData] = useState([]);       

  // State for Upcoming Data + Pagination Info
  const [upcomingData, setUpcomingData] = useState({
    items: [],
    pagination: { current: 1, pageSize: 10, total: 0 }
  });

  /* ==========================================================================
     HELPER FUNCTIONS
     ========================================================================== */

  /**
   * Process and map upcoming bills data to UI state.
   * @param {Object} data - Raw data from API response
   * @param {Number|null} clickedPage - The page number clicked by user
   * @param {Number|null} newPageSize - The new page size selected (optional)
   */
  const processUpcomingData = (data, clickedPage = null, newPageSize = null) => {
    const items = data.items || [];
    
    // Determine current page: Use clicked page OR fallback to API index
    const currentPage = clickedPage || (data.pageIndex === 0 ? 1 : data.pageIndex);

    setUpcomingData({
      items: items.map((item, idx) => ({
        key: item.invoiceId || idx,
        invoiceId: item.invoiceId,
        month: item.dueMonth,
        billingDate: item.billingDate, 
        dueDate: item.dueDate,
        amount: formatCurrency(item.amount),
        status: item.status
      })),
      pagination: {
        current: currentPage,
        pageSize: newPageSize || data.pageSize || 10,
        total: data.totalCount || 0
      }
    });
  };

  /* ==========================================================================
     DATA FETCHING LOGIC
     ========================================================================== */

  const fetchDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Execute all API requests in parallel
      const [infoRes, outstandingRes, upcomingRes, historyRes] = await Promise.all([
        getCourseDetailInfo(id),
        getCourseOutstandingFees(id, 1, 100),
        getCourseUpcomingBills(id, 1, 5), 
        getCoursePaymentHistory(id, 1, 20)
      ]);

      // 1. Set Course General Info
      if (infoRes.data) {
        const d = infoRes.data;
        setCourseInfo({
          name: d.courseName,
          provider: d.providerName,
          status: d.status,
          startDate: d.courseStart,
          endDate: d.courseEnd,
          paymentType: d.paymentType,
          billingCycle: d.billingCycle,
          feePerCycle: `${formatCurrency(d.feePerCycle)}${d.billingCycle && d.billingCycle !== 'OneTime' ? ' / ' + d.billingCycle : ''}`,
          totalFee: formatCurrency(d.courseTotalFee),
          outstanding: d.totalOutstandingFee
        });
      }

      // 2. Set Outstanding Fees
      if (outstandingRes.data && outstandingRes.data.fees) {
        const items = outstandingRes.data.fees.items || [];
        setOutstandingData(items.map((item, idx) => ({
          key: item.invoiceId || idx,
          invoiceId: item.invoiceId,
          courseName: item.courseName,
          provider: item.providerName,
          amount: formatCurrency(item.amount),
          billingCycle: item.billingCycle,
          billingDate: item.billingDate,
          dueDate: item.dueDate,
          daysLeft: item.daysUntilDue <= 0 ? 'Overdue/Due Today' : `In ${item.daysUntilDue} days`,
          status: item.paymentStatus
        })));
      }

      // 3. Set Upcoming Bills (Initial Page 1)
      if (upcomingRes.data && upcomingRes.data.billingCycles) {
        processUpcomingData(upcomingRes.data.billingCycles, 1);
      }

      // 4. Set Payment History
      if (historyRes.data && historyRes.data.paymentHistory) {
        const items = historyRes.data.paymentHistory.items || [];
        setHistoryData(items.map((item, idx) => ({
          key: idx,
          date: item.transactionDate || item.paymentDate,
          name: item.courseName,
          cycle: item.paidCycle || item.billingCycle,
          amount: formatCurrency(item.amount),
          method: item.paymentMethod,
          status: item.status
        })));
      }

    } catch (error) {
      console.error("Error fetching course details:", error);
      message.error("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* ==========================================================================
     EFFECTS
     ========================================================================== */
  
  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  /* ==========================================================================
     EVENT HANDLERS
     ========================================================================== */

  const handleRefresh = () => {
    fetchDetails();
  };

  /**
   * Handle pagination (Page Change OR Size Change) for Upcoming Bills
   * @param {Number} page - The new page number
   * @param {Number} pageSize - The new page size
   */
  const handleUpcomingPageChange = async (page, pageSize) => {
    try {
      setUpcomingLoading(true);
      
      // [FIX] Pass both page and pageSize to the API service
      const res = await getCourseUpcomingBills(id, page, pageSize); 
      
      if (res.data && res.data.billingCycles) {
        // [FIX] Update state with both new page and new pageSize
        processUpcomingData(res.data.billingCycles, page, pageSize);
      }
    } catch (error) {
      console.error("Error changing page/size:", error);
      message.error("Failed to load upcoming bills list.");
    } finally {
      setUpcomingLoading(false);
    }
  };

  /* ==========================================================================
     RENDER LOGIC
     ========================================================================== */

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading course details..." />
      </div>
    );
  }

  if (!courseInfo) return null;

  return (
    <div className={styles.detailContainer}>
      <HeaderNav
        courseName={courseInfo.name}
        provider={courseInfo.provider}
        status={courseInfo.status}
      />

      <SummaryStats
        outstanding={formatCurrency(courseInfo.outstanding)}
        totalFee={courseInfo.totalFee}
      />

      <CourseInfoGrid info={courseInfo} />

      <OutstandingFees
        data={outstandingData}
        onRefresh={handleRefresh}
      />

      {/* Upcoming Bills List with Pagination */}
      <UpcomingBillsList 
        data={upcomingData} 
        loading={upcomingLoading}
        onPageChange={handleUpcomingPageChange}
      />

      <PaymentHistoryTable data={historyData} />
    </div>
  );
};

export default CourseDetails;
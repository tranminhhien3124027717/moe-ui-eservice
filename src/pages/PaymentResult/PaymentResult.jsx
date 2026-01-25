import React, { useEffect, useState, useRef } from 'react';
import { Result, Button, Spin, Typography, Divider, Tag, Space } from 'antd';
import { 
  CheckCircleFilled, 
  CloseCircleFilled, 
  HomeOutlined, 
  ReadOutlined, 
  CopyOutlined,
  ReloadOutlined,
  QuestionCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useSearchParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import dayjs from 'dayjs';
import paymentService from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatters';
import styles from './PaymentResultPage.module.scss';

const { Title, Text, Paragraph } = Typography;
  
const PaymentResultPage = () => {
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceId = location.state?.invoiceId;
  if (!invoiceId) {
      return <Navigate to="/dashboard" replace />;
  }


  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null); 
  const [details, setDetails] = useState(null);

  // --- POLLING CONFIGURATION ---
  const retryCount = useRef(0);
  const maxRetries = 5;

  /* ==========================================================================
     PAYMENT VERIFICATION LOGIC
     ========================================================================== */
  useEffect(() => {
    const verifyPayment = async () => {
      if (!invoiceId) {
        setPaymentStatus('error');
        setLoading(false);
        return;
      }

      try {
        const response = await paymentService.checkInvoiceStatus(invoiceId);
        
        if (response && response.success && response.data !== undefined) {
          const status = typeof response.data === 'object' ? response.data.status : response.data;

          // CASE: SUCCESS
          if (status === 1) {
            await fetchInvoiceDetails();
            setPaymentStatus('success');
            setLoading(false);
            return;
          } 
          
          // CASE: PENDING / FAILED (RETRY LOGIC)
          if (retryCount.current < maxRetries) {
            retryCount.current += 1;
            setTimeout(verifyPayment, 2000); // Retry after 2s
          } else {
            setPaymentStatus('error');
            setLoading(false);
          }

        } else {
          // Invalid response -> Retry
          if (retryCount.current < maxRetries) {
            retryCount.current += 1;
            setTimeout(verifyPayment, 2000);
          } else {
            setPaymentStatus('error');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Verification Error:", error);
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          setTimeout(verifyPayment, 2000);
        } else {
          setPaymentStatus('error');
          setLoading(false);
        }
      }
    };

    verifyPayment();
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    try {
      const response = await paymentService.getInvoiceDetails(invoiceId);
      if (response && response.data) {
        setDetails(response.data);
      } else {
        setDetails({ invoiceId }); 
      }
    } catch (error) {
      console.error("Fetch Details Error:", error);
      setDetails({ invoiceId });
    }
  };

  /* ==========================================================================
     RENDER: LOADING STATE
     ========================================================================== */
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinnerWrapper}>
          <Spin size="large" />
          <p>Verifying transaction...</p>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     RENDER: SUCCESS STATE (DIGITAL RECEIPT)
     ========================================================================== */
  if (paymentStatus === 'success') {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.receiptCard}>
          {/* Header */}
          <div className={styles.successHeader}>
            <CheckCircleFilled className={styles.successIcon} />
            <Title level={3} className={styles.title}>Payment Successful</Title>
            <Text type="secondary">Thank you for your purchase!</Text>
          </div>

          <Divider dashed style={{ borderColor: '#e2e8f0', margin: '24px 0' }} />

          {/* Amount Hero */}
          <div className={styles.amountSection}>
            <Text type="secondary" className={styles.label}>Total Amount Paid</Text>
            <div className={styles.amount}>{formatCurrency(details?.amount || 0)}</div>
            <Tag color="success" className={styles.statusTag}>PAID</Tag>
          </div>

          {/* Details */}
          <div className={styles.detailsGrid}>
            <div className={styles.row}>
              <span className={styles.label}>Invoice ID</span>
              <span className={styles.valueMonospace}>
                {details?.invoiceId || invoiceId} <CopyOutlined className={styles.copyIcon} />
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Course</span>
              <span className={styles.valueHighlight}>{details?.courseName || 'N/A'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Date</span>
              <span className={styles.value}>{dayjs().format('DD MMM YYYY, HH:mm')}</span>
            </div>
            {details?.paymentMethod && (
                <div className={styles.row}>
                <span className={styles.label}>Method</span>
                <span className={styles.value}>{details.paymentMethod}</span>
                </div>
            )}
          </div>

          <Divider style={{ margin: '24px 0' }} />

          {/* Buttons */}
          <div className={styles.actions}>
            <Button 
              type="primary" size="large" icon={<ReadOutlined />}
              className={styles.primaryBtn}
              onClick={() => navigate('/courses')}
            >
              Go to My Courses
            </Button>
            <Button 
              size="large" icon={<HomeOutlined />}
              className={styles.secondaryBtn}
              onClick={() => navigate('/dashboard')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     RENDER: ERROR STATE (REDESIGNED ALERT CARD)
     ========================================================================== */
  return (
    <div className={styles.pageContainer}>
      <div className={styles.errorCard}>
        {/* 1. Error Header */}
        <div className={styles.errorHeader}>
          <div className={styles.iconWrapper}>
            <CloseCircleFilled className={styles.errorIcon} />
          </div>
          <Title level={3} className={styles.title}>Payment Unsuccessful</Title>
          <Paragraph className={styles.subtitle}>
            We couldn't confirm your payment. This might be due to a bank decline or a timeout.
          </Paragraph>
        </div>

        {/* 2. Warning Box */}
        <div className={styles.warningBox}>
            <WarningOutlined className={styles.warningIcon} />
            <Text className={styles.warningText}>
                If money was deducted from your account, it will typically be refunded automatically within 24 hours.
            </Text>
        </div>

        {/* 3. Support Info Section */}
        <div className={styles.supportSection}>
            <Text type="secondary" style={{ fontSize: '13px' }}>Reference ID for Support:</Text>
            <div className={styles.referenceId}>
                {invoiceId || 'UNKNOWN_ID'}
                <CopyOutlined className={styles.copyIcon} />
            </div>
        </div>

        <Divider style={{ margin: '24px 0' }} />

        {/* 4. Action Buttons */}
        <div className={styles.actions}>
            <Button 
              type="primary" danger size="large" icon={<ReloadOutlined />}
              className={styles.primaryBtn}
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Button 
              size="large" icon={<QuestionCircleOutlined />}
              className={styles.secondaryBtn}
              onClick={() => navigate('/support')} 
            >
              Contact Support
            </Button>
        </div>
        
        <div style={{ marginTop: 16 }}>
            <Button type="text" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
            </Button>
        </div>

      </div>
    </div>
  );
};

export default PaymentResultPage;
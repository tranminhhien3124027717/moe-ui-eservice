import React, { useState } from 'react';
import { Table, message } from 'antd';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import styles from '../CourseDetails.module.scss';
import { formatDate, formatBillingCycle } from '../../../utils/formatters';
import PayCourseFeeModal from '../../../components/modals/PayCourseFeeModal/PayCourseFeeModal';
import { DollarCircleOutlined } from '@ant-design/icons';

const OutstandingFees = ({ data, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  /* ==========================================================================
     HANDLERS
     ========================================================================== */
  const handlePayClick = (record, e) => {
    e.stopPropagation();
    
    if (record.invoiceId) {
        setSelectedInvoiceId(record.invoiceId);
        setIsModalOpen(true);
    } else {
        console.error("Record missing invoiceId:", record);
        message.error("Data Error: Invoice ID not found!");
    }
  };

  /* ==========================================================================
     TABLE CONFIGURATION
     ========================================================================== */
  const columns = [
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 300,
      render: (text, record) => (
        <div className={styles.courseCell}>
          <div className={styles.name}>{text}</div>
          <div className={styles.provider}>{record.provider}</div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'left',
      render: (text) => <span className={styles.amountText}>{text}</span>,
    },
    {
      title: 'Billing Cycle',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      width: 140,
      render: (text) => <span className={styles.cycleText}>{formatBillingCycle(text)}</span>,
    },
    {
      title: 'Billing Date',
      dataIndex: 'billingDate',
      key: 'billingDate',
      width: 140,
      render: (text) => <span className={styles.dateText}>{formatDate(text)}</span>,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 160,
      render: (text, record) => (
        <div className={styles.dueDateCell}>
          <span className={styles.date}>{formatDate(text)}</span>
          {record.daysLeft && <span className={styles.daysLeft}>{record.daysLeft}</span>}
        </div>
      ),
    },
    {
      title: 'Payment Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => <StatusTag status={status} />,     
    },
    {
      title: '',
      key: 'action',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <button 
          className={styles.payNowBtn}
          onClick={(e) => handlePayClick(record, e)}
        >
          <DollarCircleOutlined />  Pay Now
        </button>
      ),
    },
  ];

  /* ==========================================================================
     PAGINATION CONFIGURATION
     ========================================================================== */
  const paginationConfig = {
    pageSize: 5,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20'],
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} bills`,
  };

  return (
    <>
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle}>Outstanding Fees</div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={data && data.length > 5 ? paginationConfig : false}
          className={styles.outstandingTable}
          scroll={{ x: 1000 }}
          rowKey="invoiceId"
        />
      </div>

      <PayCourseFeeModal
        open={isModalOpen}
        onCancel={() => {
            setIsModalOpen(false);
            setSelectedInvoiceId(null);
        }}
        invoiceId={selectedInvoiceId}
        onPaymentSuccess={onRefresh}  
      />
    </>
  );
};

export default OutstandingFees;
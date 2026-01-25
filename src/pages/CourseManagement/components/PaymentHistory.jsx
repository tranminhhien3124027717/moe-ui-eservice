import React from 'react';
import { Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HistoryOutlined } from '@ant-design/icons';
import styles from '../CourseManagement.module.scss';
import { formatDate, formatBillingCycle, formatPaymentMethod } from '../../../utils/formatters';

const PaymentHistory = ({ data = [], loading, pagination }) => {
  // --- HOOKS ---
  const navigate = useNavigate();

  // --- COLUMNS DEFINITION ---
  const columns = [
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 280,
      fixed: 'left',
      render: (text, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{text}</span>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{record.university}</span>
        </div>
      )
    },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 120, className: styles.amountText },
    { title: 'Billing Cycle', dataIndex: 'cycle', key: 'cycle', width: 120, render: (cycle) => formatBillingCycle(cycle) },
    { title: 'Paid Date', dataIndex: 'paidDate', key: 'paidDate', width: 140, render: (date) => formatDate(date) },
    { title: 'Method', dataIndex: 'method', key: 'method', width: 150, render: (method) => formatPaymentMethod(method) },
  ];

  // --- RENDER ---
  return (
    <div className={styles.sectionContainer}>
      {/* Header Block */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrapper}>
          <HistoryOutlined className={styles.icon} style={{ color: '#389e0d' }} />
          <div className={styles.text}>
            <strong>Payment History</strong>
            <span>Your completed course fee payments</span>
          </div>
        </div>
      </div>

      {/* Table Block */}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}       
        pagination={pagination} 
        className={styles.customTable}
        scroll={{ x: 800 }}
        rowKey="key"
      />
    </div>
  );
};

export default PaymentHistory;
import React from 'react';
import { Table } from 'antd';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import styles from '../CourseDetails.module.scss';
import { formatDate, formatPaymentMethod } from '../../../utils/formatters';

const PaymentHistoryTable = ({ data }) => {
  /* ==========================================================================
     TABLE COLUMNS CONFIGURATION
     ========================================================================== */
  const historyColumns = [
    { title: 'Payment Date', dataIndex: 'date', key: 'date', width: 150, render: (date) => formatDate(date) },
    {
      title: 'Course Name',
      dataIndex: 'name',
      key: 'name',
      render: t => <span style={{ color: '#1e293b', fontWeight: 500 }}>{t}</span>
    },
    { title: 'Paid Cycle', dataIndex: 'cycle', key: 'cycle', width: 130 },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'center',
      render: (amount) => <span className={styles.amountText}>{amount}</span>
    },
    { title: 'Payment Method', dataIndex: 'method', key: 'method', width: 180, render: (method) => formatPaymentMethod(method) },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140, 
      align: 'center',
      render: (status) => <StatusTag status={status} />
    },
  ];

  /* ==========================================================================
     PAGINATION CONFIGURATION
     ========================================================================== */
  const paginationConfig = {
    pageSize: 5, 
    showSizeChanger: true, 
    pageSizeOptions: ['5', '10', '20'], 
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`, 
    position: ['bottomRight'], 
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionTitle}>Payment History</div>
      <Table
        columns={historyColumns}
        dataSource={data}
        pagination={data && data.length > 5 ? paginationConfig : false} 
        className={styles.historyTable}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default PaymentHistoryTable;
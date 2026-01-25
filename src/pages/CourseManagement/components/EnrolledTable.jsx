import React from 'react';
import { Table } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from '../CourseManagement.module.scss';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import { formatDate, formatBillingCycle } from '../../../utils/formatters';

const EnrolledTable = ({ data = [], loading, pagination }) => {
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
          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
            {text}
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            {record.university}
          </span>
        </div>
      )
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: t => <b style={{ color: '#1e293b', whiteSpace: 'nowrap' }}>{t}</b>
    },
    {
      title: 'Billing Cycle',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      width: 130,
      render: (cycle) => <span style={{ whiteSpace: 'nowrap' }}>{formatBillingCycle(cycle)}</span>
    },
    {
      title: 'Enrolled On',
      dataIndex: 'enrolledDate',
      key: 'enrolledDate',
      width: 140,
      render: (date) => <span style={{ whiteSpace: 'nowrap' }}>{formatDate(date)}</span>
    },
    {
      title: 'Billing Date',
      dataIndex: 'nextBillDate',
      key: 'nextBillDate',
      width: 140,
      render: (date) => <span style={{ whiteSpace: 'nowrap' }}>{formatDate(date)}</span>
    },
    {
      title: 'Payment Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => <StatusTag status={status} />
    }
  ];

  // --- RENDER ---
  return (
    <div className={styles.sectionContainer}>
      {/* Header Block */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrapper}>
          <ReadOutlined className={styles.icon} style={{ color: '#0f766e' }} />
          <div className={styles.text}>
            <strong>Enrolled Courses</strong>
            <span>Your current course enrollments</span>
          </div>
        </div>
      </div>

      {/* Table Block */}
      <Table
        columns={columns}
        dataSource={data} 
        loading={loading}       // Server loading state
        pagination={pagination} // Server pagination config
        className={styles.customTable}
        scroll={{ x: 1000 }}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => navigate(`/course-details/${record.id}`),
          style: { cursor: 'pointer' }
        })}
      />
    </div>
  );
};

export default EnrolledTable;
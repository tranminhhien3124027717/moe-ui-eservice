import React, { useMemo } from 'react';
import { Table } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import styles from '../CourseManagement.module.scss';
import { formatDate, formatBillingCycle, formatPaymentMethod, formatCurrency } from '../../../utils/formatters';

const parseAmountValue = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9\.-]+/g, '');
    const parsed = Number.parseFloat(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const PaymentHistory = ({ data = [], loading, pagination }) => {

  const normalizeTransactionDate = (value) => {
    if (!value) {
      return { displayDate: null, timestamp: null };
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return { displayDate: value.toISOString(), timestamp: value.getTime() };
    }

    if (typeof value === 'string') {
      const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/);
      if (isoMatch) {
        const base = isoMatch[1];
        const fraction = isoMatch[2] ? isoMatch[2].slice(0, 4) : '';
        const timezone = isoMatch[3] || 'Z';
        const sanitized = `${base}${fraction}${timezone}`;
        const date = new Date(sanitized);
        if (!Number.isNaN(date.getTime())) {
          return { displayDate: sanitized, timestamp: date.getTime() };
        }
      }

      const compactIsoMatch = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d+)/);
      if (compactIsoMatch) {
        const base = compactIsoMatch[1];
        const fractionDigits = compactIsoMatch[2].slice(0, 3).padEnd(3, '0');
        const sanitized = `${base}.${fractionDigits}Z`;
        const date = new Date(sanitized);
        if (!Number.isNaN(date.getTime())) {
          return { displayDate: sanitized, timestamp: date.getTime() };
        }
      }

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/');
        const isoString = `${year}-${month}-${day}T00:00:00+08:00`;
        const date = new Date(isoString);
        if (!Number.isNaN(date.getTime())) {
          return { displayDate: isoString, timestamp: date.getTime() };
        }
      }

      const fallback = new Date(value);
      if (!Number.isNaN(fallback.getTime())) {
        return { displayDate: fallback.toISOString(), timestamp: fallback.getTime() };
      }
    }

    return { displayDate: value, timestamp: null };
  };

  const historyItems = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.history?.items)) return data.history.items;
    return [];
  }, [data]);

  const tableData = useMemo(() => {
    return historyItems.map((item, index) => {
      const fallbackDateInfo = normalizeTransactionDate(
        item?.paidDate || item?.paymentDate || item?.transactionDate || null
      );

      const transactions = Array.isArray(item.transactions)
        ? item.transactions.map((txn) => {
            const rawDate = txn?.transactionDate || txn?.paymentDate || null;
            const { displayDate, timestamp } = normalizeTransactionDate(rawDate);
            const amountSource = txn?.amount ?? txn?.amountPaid ?? null;
            const amountValue = amountSource !== null && amountSource !== undefined
              ? parseAmountValue(amountSource)
              : null;
            return {
              ...txn,
              amount: amountValue,
              displayDate,
              timestamp
            };
          })
        : [];

      const amountSource = item?.amountPaid ?? item?.amount ?? null;
      const amountValue = amountSource !== null && amountSource !== undefined
        ? parseAmountValue(amountSource)
        : null;

      return {
        key: item?.invoiceId || item?.key || index,
        courseName: item?.courseName || '—',
        providerName: item?.providerName || item?.university || '—',
        amountPaid: amountValue,
        billingCycle: item?.billingCycle ?? item?.cycle ?? '—',
        paymentMethod: item?.paymentMethod || '—',
        transactions,
        fallbackDate: fallbackDateInfo.displayDate
      };
    });
  }, [historyItems]);

  const getLatestTransactionDate = (transactions) => {
    if (!transactions?.length) return null;
    return transactions.reduce((latest, txn) => {
      if (txn?.timestamp === null || txn?.timestamp === undefined) return latest;
      if (!latest) return txn;
      return txn.timestamp > latest.timestamp ? txn : latest;
    }, null);
  };

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
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{record.providerName}</span>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amountPaid',
      key: 'amountPaid',
      width: 140,
      className: styles.amountText,
      render: (value) => {
        if (value === null || value === undefined) return '—';
        return formatCurrency(value, { minimumFractionDigits: 2 });
      }
    },
    {
      title: 'Billing Cycle',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      width: 140,
      render: (cycle) => formatBillingCycle(cycle)
    },
    {
      title: 'Paid Date',
      dataIndex: 'transactions',
      key: 'paidDate',
      width: 160,
      render: (_, record) => {
        const latestTransaction = getLatestTransactionDate(record.transactions);
        if (latestTransaction?.displayDate) {
          return formatDate(latestTransaction.displayDate);
        }
        if (record?.fallbackDate) {
          return formatDate(record.fallbackDate);
        }
        return '—';
      }
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 200,
      render: (method) => formatPaymentMethod(method)
    }
  ];

  // --- EXPANDABLE CONFIGURATION ---
  const expandable = {
    expandedRowRender: (record) => {
      if (!record.transactions || record.transactions.length <= 1) return null;
      
      return (
        <table className={styles.childTable}>
          <tbody>
            {record.transactions.map((txn, idx) => (
              <tr key={`${record.key}-txn-${idx}`} className={styles.childRow}>
                <td className={styles.childExpandSpace}></td>
                <td className={styles.childCol1}>
                  <span className={styles.childLabel}>Transaction {idx + 1}</span>
                </td>
                <td className={styles.childCol2}>
                  <span className={styles.amountText}>
                    {txn.amount !== null && txn.amount !== undefined
                      ? formatCurrency(txn.amount, { minimumFractionDigits: 2 })
                      : '—'}
                  </span>
                </td>
                <td className={styles.childCol3}>{formatBillingCycle(record.billingCycle)}</td>
                <td className={styles.childCol4}>
                  {txn.displayDate ? formatDate(txn.displayDate) : '—'}
                </td>
                <td className={styles.childCol5}>{formatPaymentMethod(txn.paymentMethod)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    },
    rowExpandable: (record) => record.transactions && record.transactions.length > 1,
    expandIcon: ({ expanded, onExpand, record }) => {
      if (!record.transactions || record.transactions.length <= 1) return null;
      return (
        <button
          type="button"
          className={styles.expandIcon}
          onClick={(e) => onExpand(record, e)}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      );
    }
  };

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
        dataSource={tableData}
        loading={loading}       
        pagination={pagination} 
        className={styles.customTable}
        scroll={{ x: 800 }}
        rowKey="key"
        expandable={expandable}
      />
    </div>
  );
};

export default PaymentHistory;
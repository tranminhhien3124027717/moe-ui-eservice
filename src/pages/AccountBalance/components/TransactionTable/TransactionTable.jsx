import React from "react";
import { Table } from "antd";
import StatusTag from '../../../../components/common/StatusTag/StatusTag';
import { formatCurrency } from '../../../../utils/formatters';
import styles from "./TransactionTable.module.scss";

const TransactionTable = ({ data, onRowClick, pagination }) => {
  
  // --- Columns Configuration ---
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      width: 130,
      render: (text) => <span className={styles.dateText}>{text}</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 180,
      render: (text) => <StatusTag status={text} />,
    },
    {
      title: "Description",
      dataIndex: "description",
      // Increased width to allow more text visibility
      width: 280, 
      render: (text, record) => (
        <div className={styles.descColumn}>
          {/* Added 'title' attribute for native browser tooltip on hover */}
          <div className={styles.mainDesc} title={text}>
            {text || '-'}
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      width: 150,
      render: (amount, record) => {
        // Logic to determine positive (+) or negative (-) display
        const isTopUp = record.type === 'Balance Top-up';
        return (
          <span className={isTopUp ? styles.positiveAmount : styles.negativeAmount}>
            {isTopUp ? "+" : "-"}{formatCurrency(Math.abs(amount))}
          </span>
        );
      },
    },
    {
      title: "Balance",
      dataIndex: "balance",
      align: "right",
      width: 150,
      render: (balance) => <span className={styles.balanceText}>{formatCurrency(balance)}</span>,
    },
  ];

  // --- Render Table ---
  return (
    <Table
      columns={columns}
      dataSource={data}
      // Pagination Configuration
      pagination={pagination ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: pagination.onChange,
        onShowSizeChange: pagination.onShowSizeChange,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total) => `Total ${total} transactions`
      } : false}
      rowKey="key"
      className={styles.transactionTable}
      scroll={{ x: 800 }} 
      onRow={(record) => ({
        onClick: () => onRowClick(record),
      })}
    />
  );
};

export default TransactionTable;
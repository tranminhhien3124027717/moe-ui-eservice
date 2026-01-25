import React, { useState } from 'react';
import { Table, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ExclamationCircleOutlined, DollarCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'; 
import styles from '../CourseManagement.module.scss';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import { formatDate, formatBillingCycle, formatCurrency } from '../../../utils/formatters';
import PayCourseFeeModal from '../../../components/modals/PayCourseFeeModal/PayCourseFeeModal';

dayjs.extend(customParseFormat);

const PendingFees = ({ 
    data = [], 
    loading, 
    pagination, 
    onRefresh 
}) => {
    // --- STATE & HOOKS ---
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

    // --- HELPER FUNCTIONS ---
    const calculateDaysLeft = (dueDate) => {
        if (!dueDate) return '—';
        const due = dayjs(dueDate, 'DD/MM/YYYY').startOf('day');
        const today = dayjs().startOf('day');
        const daysRemaining = due.diff(today, 'day');

        if (daysRemaining > 0) return `In ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
        if (daysRemaining === 0) return 'Due today';
        return `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''}`;
    };

    const handlePayClick = (record, e) => {
        e.stopPropagation();
        if (record.invoiceId) {
            setSelectedInvoiceId(record.invoiceId);
            setIsModalOpen(true);
        } else {
            message.error("Data Error: Invoice ID missing!");
        }
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
                    <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                        {record.providerName || record.university}
                    </span>
                </div>
            )
        },
        { 
            title: 'Amount', 
            dataIndex: 'amountDue', 
            key: 'amountDue', 
            width: 120, 
            className: styles.amountText,
            render: (val) => typeof val === 'number' ? formatCurrency(val) : val
        },
        { 
            title: 'Billing Cycle', 
            dataIndex: 'billingCycle', 
            key: 'billingCycle', 
            width: 120, 
            render: (c) => formatBillingCycle(c) 
        },
        { 
            title: 'Billing Date', 
            dataIndex: 'billingDate', 
            key: 'billingDate', 
            width: 140, 
            render: (d) => formatDate(d) 
        },
        {
            title: 'Due Date', 
            dataIndex: 'dueDate', 
            key: 'dueDate', 
            width: 140,
            render: (text) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatDate(text)}</span>
                    <span style={{ fontSize: 11, color: '#d46b08' }}>{calculateDaysLeft(text)}</span>
                </div>
            )
        },
        {
            title: 'Payment Status', 
            dataIndex: 'paymentStatus', 
            key: 'paymentStatus', 
            width: 140,
            render: (status) => <StatusTag status={status} />
        },
        {
            title: '', 
            key: 'action', 
            width: 140, 
            align: 'right',
            render: (_, record) => (
                <button 
                    className={styles.payNowSmall} 
                    onClick={(e) => handlePayClick(record, e)}
                >
                    <DollarCircleOutlined />  Pay Now
                </button>
            )
        }
    ];

    // --- RENDER ---
    return (
        <div className={styles.sectionContainer}>
            {/* Header Block */}
            <div className={styles.sectionHeader}>
                <div className={styles.titleWrapper}>
                    <ExclamationCircleOutlined className={styles.icon} style={{ color: '#d46b08' }} />
                    <div className={styles.text}>
                        <strong>Outstanding Fees</strong>
                        <span>Outstanding course fees requiring payment</span>
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
                scroll={{ x: 1000 }}
                rowKey="invoiceId"
            />

            {/* Payment Modal Block */}
            <PayCourseFeeModal
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedInvoiceId(null);
                }}
                invoiceId={selectedInvoiceId}
                onPaymentSuccess={onRefresh}
            />
        </div>
    );
};

export default PendingFees;
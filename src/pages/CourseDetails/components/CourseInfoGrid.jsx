import React from 'react';
import {
    BookOutlined,
    CalendarOutlined,
    CreditCardOutlined,
    CheckCircleOutlined,
    BankOutlined,
    SyncOutlined,
    DollarOutlined
} from '@ant-design/icons';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import styles from '../CourseDetails.module.scss';
import { formatDate, formatBillingCycle } from '../../../utils/formatters';

const CourseInfoGrid = ({ info }) => {
    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>Course Information</div>
            <div className={styles.infoGrid}>

                <InfoItem icon={<BookOutlined />} label="Course Name" value={info.name} />
                <InfoItem icon={<CalendarOutlined />} label="Course Start" value={formatDate(info.startDate)} />


                <InfoItem icon={<CreditCardOutlined />} label="Payment Type" value={info.paymentType} />


                <InfoItem icon={<CalendarOutlined />} label="Course End" value={formatDate(info.endDate)} />
                <InfoItem icon={<BankOutlined />} label="Provider" value={info.provider} />

                {/* Chỉ hiển thị Billing Cycle nếu là Recurring */}
                {info.paymentType === 'Recurring' && (
                    <InfoItem icon={<SyncOutlined />} label="Billing Cycle" value={formatBillingCycle(info.billingCycle)} />
                )}

                <div className={styles.infoItem}>
                    <CheckCircleOutlined className={styles.itemIcon} />
                    <div className={styles.itemContent}>
                        <span className={styles.label}>Status</span>
                        <StatusTag status={info.status} />
                    </div>
                </div>

                {/* Chỉ hiển thị Fee per Cycle nếu là Recurring */}
                {info.paymentType === 'Recurring' && (
                    <InfoItem icon={<DollarOutlined />} label="Fee per Cycle" value={info.feePerCycle} />
                )}
            </div>
        </div>
    );
};

// Component con nội bộ để giảm lặp code
const InfoItem = ({ icon, label, value }) => (
    <div className={styles.infoItem}>
        {React.cloneElement(icon, { className: styles.itemIcon })}
        <div className={styles.itemContent}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{value}</span>
        </div>
    </div>
);

export default CourseInfoGrid;
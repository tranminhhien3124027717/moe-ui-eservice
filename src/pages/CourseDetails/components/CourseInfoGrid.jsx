import React from 'react';
import {
    BookOutlined,
    CalendarOutlined,
    CreditCardOutlined,
    CheckCircleOutlined,
    BankOutlined,
    SyncOutlined,
    DollarOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import styles from '../CourseDetails.module.scss';
import { formatDate, formatBillingCycle } from '../../../utils/formatters';

const CourseInfoGrid = ({ info }) => {
    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>Course Information</div>
            <div className={styles.infoGrid}>
                
                {/* 1. Course Name */}
                <InfoItem icon={<BookOutlined />} label="Course Name" value={info.name} />
                
                {/* 2. Provider */}
                <InfoItem icon={<BankOutlined />} label="Provider" value={info.provider} />
                
                {/* 3. Education Level */}
                <InfoItem icon={<TrophyOutlined />} label="Education Level" value={info.educationLevel} />

                {/* 4. Course Start */}
                <InfoItem icon={<CalendarOutlined />} label="Course Start" value={formatDate(info.startDate)} />
                
                {/* 5. Payment Type */}
                <InfoItem icon={<CreditCardOutlined />} label="Payment Type" value={info.paymentType} />

                {/* 6. Billing Cycle (Only if Recurring) */}
                {info.paymentType === 'Recurring' && (
                    <InfoItem icon={<SyncOutlined />} label="Billing Cycle" value={formatBillingCycle(info.billingCycle)} />
                )}

                {/* 7. Course End (Placed here as per your snippet) */}
                <InfoItem icon={<CalendarOutlined />} label="Course End" value={formatDate(info.endDate)} />

                {/* 8. Fee per Cycle (Only if Recurring) */}
                {info.paymentType === 'Recurring' && (
                    <InfoItem icon={<DollarOutlined />} label="Fee per Cycle" value={info.feePerCycle} />
                )}

                {/* 9. Status */}
                <div className={styles.infoItem}>
                    <CheckCircleOutlined className={styles.itemIcon} />
                    <div className={styles.itemContent}>
                        <span className={styles.label}>Status</span>
                        <StatusTag status={info.status} />
                    </div>
                </div>

            </div>
        </div>
    );
};

// Internal reusable component
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
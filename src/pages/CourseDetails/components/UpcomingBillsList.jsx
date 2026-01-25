import React from 'react';
import { Pagination, Spin, Empty } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import styles from '../CourseDetails.module.scss';
import { formatDate } from '../../../utils/formatters';

const UpcomingBillsList = ({ data, loading, onPageChange }) => {
  const items = data?.items || [];
  const pagination = data?.pagination || { current: 1, pageSize: 10, total: 0 };
  const isEmpty = items.length === 0;

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionTitle}>Upcoming Billing Cycles</div>
      
      <Spin spinning={loading}>
        {isEmpty ? (
          <Empty description="No upcoming billing cycles" />
        ) : (
          <>
            {/* DANH SÁCH ITEM */}
            <div className={styles.billingList}>
              {items.map(bill => (
                <div key={bill.key} className={styles.billingItem}>
                  
                  {/* TRÁI: Icon & Thông tin */}
                  <div className={styles.leftSide}>
                    <div className={styles.calendarIcon}>
                      <CalendarOutlined />
                    </div>
                    <div className={styles.dateInfo}>
                      <span className={styles.month}>{bill.month}</span>
                      <div className={styles.subDates}>
                        <span className={styles.billingDate}>
                           Billed: {formatDate(bill.billingDate)}
                        </span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.due}>
                           Due: {formatDate(bill.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PHẢI: Xếp dọc (Amount trên, Status dưới) */}
                  <div className={styles.rightSide}>
                    <span className={styles.amount}>{bill.amount}</span>
                    <StatusTag status={bill.status} />
                  </div>

                </div>
              ))}
            </div>

            {/* PHÂN TRANG */}
            {pagination.total > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  
                  // [FIX] Bật tính năng thay đổi size
                  showSizeChanger={true} 
                  pageSizeOptions={['5', '10', '20', '50']} 
                  
                  // [FIX] Truyền cả page và pageSize về component cha
                  onChange={(page, pageSize) => onPageChange(page, pageSize)}
                />
              </div>
            )}
          </>
        )}
      </Spin>
    </div>
  );
};

export default UpcomingBillsList;
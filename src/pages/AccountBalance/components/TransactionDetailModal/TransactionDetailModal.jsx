import React from "react";
import { Modal, Divider } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import StatusTag from '../../../../components/common/StatusTag/StatusTag';
import { formatCurrency } from '../../../../utils/formatters';
import styles from "./TransactionDetailModal.module.scss";

const TransactionDetailModal = ({ open, onClose, transaction }) => {
  if (!transaction) return null;

  return (
    <Modal
      title="Transaction Details"
      open={open}
      onCancel={onClose}
      footer={null}
      className={styles.detailModal} 
      width={480}
      closeIcon={<CloseOutlined />}
      centered
    >
      <div className={styles.modalContent}>
        <p className={styles.modalSubtitle}>Detailed information about this transaction</p>
        
        <div className={styles.amountSection}>
          {(() => {
            const isTopUp = transaction.type === 'Balance Top-up';
            return (
              <>
                <h1 className={isTopUp ? styles.positive : styles.negative}>
                  {isTopUp ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </h1>
                <span>Transaction Amount</span>
              </>
            );
          })()}
        </div>

        <Divider className={styles.divider} />

        <div className={styles.detailGrid}>
          <DetailRow label="Transaction Type">
            <StatusTag status={transaction.type} />
          </DetailRow>
          
          <div className={styles.detailItemFull}>
            <label>Description</label>
            <p className={styles.descriptionText}>{transaction.description}</p>
          </div>

          <DetailRow label="Date" value={transaction.date} />

          <DetailRow label="Status">
            <StatusTag status="completed" />
          </DetailRow>

          {/* <div className={styles.detailItemFull}>
            <label>Reference ID</label>
            <div className={styles.referenceBox}>
              {transaction.referenceId || '-'}
            </div>
          </div> */}

          {transaction.balance !== undefined && (
            <DetailRow label="Balance After" value={formatCurrency(transaction.balance)} />
          )}
        </div>
      </div>
    </Modal>
  );
};

const DetailRow = ({ label, value, children }) => (
  <div className={styles.detailItem}>
    <label>{label}</label>
    {children ? children : <p>{value || '-'}</p>}
  </div>
);

export default TransactionDetailModal;
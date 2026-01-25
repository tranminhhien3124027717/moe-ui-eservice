import React from "react";
import { Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import styles from "./BalanceHero.module.scss";
import { formatCurrency } from "../../../../utils/formatters";

const BalanceHero = ({ balance, onPayClick }) => {
  return (
    <div className={styles.heroCard}>
      <div className={styles.balanceInfo}>
        <span className={styles.label}>Current Balance</span>
        <h1 className={styles.amount}>{formatCurrency(balance)}</h1>
        <span className={styles.subLabel}>Available for Education Courses Payment</span>
      </div>
      <div className={styles.actionArea}>
        <Button className={styles.payBtn} onClick={onPayClick}>
          Pay Courses <ArrowRightOutlined />
        </Button>
      </div>
    </div>
  );
};

export default BalanceHero;
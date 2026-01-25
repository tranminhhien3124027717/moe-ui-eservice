import React from "react";
import { Input, Select } from "antd";
import { 
  SearchOutlined, 
  FilterOutlined, 
  CalendarOutlined, 
  DollarOutlined 
} from "@ant-design/icons";
import styles from "./TransactionFilters.module.scss";

const TransactionFilters = ({ filters, setFilters }) => {
  // Hàm helper để update từng trường trong object state
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.filterToolbar}>
      {/* Search Box */}
      <div className={styles.searchBox}>
        <Input 
          prefix={<SearchOutlined style={{ color: "#94a3b8", fontSize: '18px', marginRight: '8px' }} />} 
          placeholder="Search transactions..." 
          className={styles.searchInput}
          onChange={(e) => handleChange('search', e.target.value)}
          value={filters.search}
        />
      </div>
      
      {/* Filter Actions */}
      <div className={styles.filterActions}>
        {/* Type Filter */}
        <div className={styles.selectWrapper}>
          <FilterOutlined className={styles.selectIcon} />
          <Select
            value={filters.type}
            onChange={(val) => handleChange('type', val)}
            className={styles.filterSelect}
            classNames={{ popup: 'balance-dropdown' }}
            options={[
              { label: 'All Types', value: 'all' },
              { label: 'Course Payment', value: 'course' },
              { label: 'Balance Top-up', value: 'topup' }
            ]}
          />
        </div>

        {/* Time Filter */}
        <div className={styles.selectWrapper}>
          <CalendarOutlined className={styles.selectIcon} />
          <Select
            value={filters.time}
            onChange={(val) => handleChange('time', val)}
            className={styles.filterSelect}
            classNames={{ popup: 'balance-dropdown' }}
            options={[
              { label: 'All Time', value: 'all' },
              { label: 'Today', value: 'today' },
              { label: 'Last 7 days', value: '7days' },
              { label: 'Last 30 days', value: '30days' },
              { label: 'Last 3 Months', value: '3months' },
              { label: 'Last Year', value: 'year' }
            ]}
          />
        </div>

        {/* Amount Filter */}
        <div className={styles.selectWrapper}>
          <DollarOutlined className={styles.selectIcon} />
          <Select
            value={filters.amount}
            onChange={(val) => handleChange('amount', val)}
            className={styles.filterSelect}
            classNames={{ popup: 'balance-dropdown' }}
            options={[
              { label: 'All Amounts', value: 'all' },
              { label: '$0 - $50', value: '0-50' },
              { label: '$50 - $100', value: '50-100' },
              { label: '$100 - $500', value: '100-500' },
              { label: '$500 - $1000', value: '500-1000' },
              { label: '$1000 +', value: 'over1000' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
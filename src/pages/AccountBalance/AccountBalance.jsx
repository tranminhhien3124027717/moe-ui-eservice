import React, { useState, useEffect, useRef } from "react";
import { Typography, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import { HistoryOutlined } from "@ant-design/icons";
import styles from "./AccountBalance.module.scss";

// Import các component con
import BalanceHero from "./components/BalanceHero/BalanceHero";
import TransactionFilters from "./components/TransactionFilters/TransactionFilters";
import TransactionTable from "./components/TransactionTable/TransactionTable";
import TransactionDetailModal from "./components/TransactionDetailModal/TransactionDetailModal";
import BalanceInfoTooltip from "./components/BalanceInfoTooltip/BalanceInfoTooltip";

// Import service
import { getAccountBalance, getBalanceTransactionHistory } from "../../services/balanceService";

const { Title, Text } = Typography;

const AccountBalance = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dùng useRef để kiểm tra lần chạy đầu tiên
  const isFirstRun = useRef(true);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });

  const [filters, setFilters] = useState({ 
    type: 'all', 
    time: 'all', 
    amount: 'all', 
    search: '' 
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // --- LOGIC MAPPING PARAMETERS ---
  const mapFiltersToParams = () => {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };

    // 1. Map Type
    if (filters.type === 'topup') params.type = 0;
    else if (filters.type === 'course') params.type = 1;

    // 2. Map Time
    const timeFilterMap = {
      'today': 0, '7days': 1, '30days': 2, '3months': 3, 'year': 4
    };
    if (filters.time !== 'all') params.dateFilter = timeFilterMap[filters.time];

    // 3. Map Amount
    const amountFilterMap = {
      '0-50': 0, '50-100': 1, '100-500': 2, '500-1000': 3, 'over1000': 4
    };
    if (filters.amount !== 'all') params.amountRange = amountFilterMap[filters.amount];


    if (filters.search && filters.search.trim() !== '') {
        params.searchTerm = filters.search.trim(); 
    }

    return params;
  };

  // --- FETCH DATA FUNCTIONS ---
  const fetchBalance = async () => {
    try {
      const res = await getAccountBalance();
      setBalance(res.data?.balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = mapFiltersToParams();
      
      // Debug: Bật lên để xem params gửi đi có đúng không
      // console.log("Fetching API with params:", params);

      const res = await getBalanceTransactionHistory(params);
      
      if (res.data?.history) {
        const mapped = res.data.history.items?.map((item, idx) => {
          const typeDisplay = item.type === 'CoursePayment' ? 'Course Payment' : 
                             item.type === 'TopUp' ? 'Balance Top-up' : item.type;
          
          return {
            id: item.id || idx,
            key: item.id || idx,
            date: item.transactionDate || '-',
            type: typeDisplay,
            description: item.description || '-',
            referenceId: item.referenceId || '-',
            amount: item.amount || 0,
            balance: item.balanceAfter || 0
          };
        }) || [];
        
        setTransactions(mapped);
        setPagination(prev => ({
          ...prev,
          total: res.data.history.totalCount || 0
        }));
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // message.error('Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECTS ---
  
  // 1. Chỉ gọi fetchBalance 1 lần khi mount
  useEffect(() => {
    fetchBalance();
  }, []);

  // 2. Fetch Transactions (Xử lý thông minh cho lần đầu + debounce các lần sau)
  useEffect(() => {
    // TH1: Nếu là lần đầu tiên render (vừa vào trang) -> Gọi NGAY LẬP TỨC
    if (isFirstRun.current) {
        isFirstRun.current = false; // Đánh dấu đã chạy lần đầu
        fetchTransactions();
        return;
    }

    // TH2: Nếu là các lần update sau (do gõ search hoặc đổi filter) -> Debounce 500ms
    // Để tránh spam API khi user đang gõ chữ
    const timer = setTimeout(() => {
        fetchTransactions();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, pagination.page, pagination.pageSize]);

  // --- HANDLERS ---
  const handleRowClick = (record) => {
    setSelectedTransaction(record);
    setIsModalOpen(true);
  };

  // Hàm custom để reset page về 1 khi thay đổi filter
  const handleFilterChange = (newFiltersOrUpdater) => {
      setFilters(prev => {
          const updated = typeof newFiltersOrUpdater === 'function' 
              ? newFiltersOrUpdater(prev) 
              : newFiltersOrUpdater;
          return updated;
      });
      // Luôn reset về trang 1 khi đổi bộ lọc để tránh data rỗng
      setPagination(prev => ({ ...prev, page: 1 }));
  };

  // --- RENDER ---
  return (
    <div className={styles.balancePage}>
      {/* 1. Header Trang */}
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={2} className={styles.pageTitle} style={{ margin: 0 }}>
            Account Balance
          </Title>
          {/* Tooltip thông tin */}
          <BalanceInfoTooltip />
        </div>
        <Text className={styles.pageSubtitle}>View your education account balance and transactions</Text>
      </div>

      {/* 2. Hero Card (Số dư) */}
      <BalanceHero 
        balance={balance} 
        onPayClick={() => navigate('/courses')} 
      />

      {/* 3. Lịch sử giao dịch */}
      <div className={styles.historyContainer}>
        <div className={styles.containerHeader}>
          <div className={styles.left}>
            <HistoryOutlined className={styles.headerIcon} />
            <span className={styles.headerTitle}>Balance History</span>
          </div>
        </div>

        <div className={styles.containerBody}>
          <TransactionFilters 
            filters={filters} 
            setFilters={handleFilterChange} 
          />
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Spin size="large" tip="Loading transactions..." ><></></Spin>
            </div>
          ) : (
            <TransactionTable 
              data={transactions} 
              onRowClick={handleRowClick}
              pagination={{
                current: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page) => setPagination(prev => ({ ...prev, page })),
                onShowSizeChange: (_, pageSize) => setPagination(prev => ({ ...prev, pageSize, page: 1 }))
              }}
            />
          )}
        </div>
      </div>

      {/* 4. Modal Chi tiết */}
      <TransactionDetailModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default AccountBalance;
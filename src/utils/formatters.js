// Utility functions for formatting data

/**
 * Format date to dd/MM/yyyy format with UTC+7 timezone adjustment
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date string in dd/MM/yyyy format
 */
export const formatDate = (date) => {
  if (!date || date === '—' || date === '-') return '—';
  
  try {
    let dateObj;
    
    // If it's already in dd/MM/yy or dd/MM/yyyy format, return as is or convert
    if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{2,4}$/.test(date)) {
      const parts = date.split('/');
      if (parts[2].length === 2) {
        // Convert yy to yyyy
        return `${parts[0]}/${parts[1]}/20${parts[2]}`;
      }
      return date;
    }
    
    // If it's in "13 Jan 2026" format, convert to dd/MM/yyyy
    if (typeof date === 'string' && /^\d{1,2}\s+\w{3}\s+\d{4}$/.test(date)) {
      dateObj = new Date(date);
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) {
      return date; // Return original if invalid
    }
    
    // Convert UTC to UTC+7
    const utcTime = dateObj.getTime();
    const utcOffset = dateObj.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
    const utc7Offset = 7 * 60 * 60000; // UTC+7 in milliseconds
    const localTime = new Date(utcTime + utcOffset + utc7Offset);
    
    const day = String(localTime.getDate()).padStart(2, '0');
    const month = String(localTime.getMonth() + 1).padStart(2, '0');
    const year = localTime.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return date; // Return original if error
  }
};

/**
 * Format datetime to dd/MM/yyyy HH:mm format with UTC+7 timezone adjustment
 * @param {string|Date} datetime - Datetime string or Date object
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime) => {
  if (!datetime || datetime === '—' || datetime === '-') return '—';
  
  try {
    const dateObj = new Date(datetime);
    
    if (isNaN(dateObj.getTime())) {
      return datetime; // Return original if invalid
    }
    
    // Convert UTC to UTC+7
    const utcTime = dateObj.getTime();
    const utcOffset = dateObj.getTimezoneOffset() * 60000;
    const utc7Offset = 7 * 60 * 60000;
    const localTime = new Date(utcTime + utcOffset + utc7Offset);
    
    const day = String(localTime.getDate()).padStart(2, '0');
    const month = String(localTime.getMonth() + 1).padStart(2, '0');
    const year = localTime.getFullYear();
    const hours = String(localTime.getHours()).padStart(2, '0');
    const minutes = String(localTime.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return datetime;
  }
};

/**
 * Format billing cycle text
 * @param {string} cycle - Billing cycle value
 * @returns {string} Formatted billing cycle text
 */
export const formatBillingCycle = (cycle) => {
  if (!cycle || cycle === '—' || cycle === '-') return '—';
  
  const cycleMap = {
    'one_time': 'One time',
    'One Time': 'One time',
    'Monthly': 'Monthly',
    'Quarterly': 'Quarterly',
    'Semester': 'Semester',
    'Installment': 'Installment'
  };
  
  return cycleMap[cycle] || cycle;
};

/**
 * Format payment method text
 * @param {string} method - Payment method value
 * @returns {string} Formatted payment method text
 */
export const formatPaymentMethod = (method) => {
  if (!method || method === '—' || method === '-') return '—';
  
  const methodMap = {
    'PayNow': 'Account Balance',
    'Account Balance': 'Account Balance',
    'Bank Transfer': 'Bank Transfer',
    'Credit Card': 'Credit Card',
    'Giro': 'Giro',
    'GrabPay': 'GrabPay'
  };
  
  return methodMap[method] || method;
};

/**
 * Format status text by adding spaces between words
 * @param {string} status - Status value (e.g., "NotInSchool", "PostSecondary")
 * @returns {string} Formatted status text with spaces
 */
export const formatStatus = (status) => {
  if (!status || status === '—' || status === '-') return '—';
  
  // Add space before capital letters (camelCase to Title Case)
  return status.replace(/([A-Z])/g, ' $1').trim();
};

/**
 * Format currency amount to Singapore Dollar (S$) format
 * @param {number} amount - Amount to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string (e.g., "S$1,234" or "S$1,234.50")
 */
export const formatCurrency = (amount, options = {}) => {
  if (amount === null || amount === undefined) return '—';
  
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    locale = 'en-US'
  } = options;
  
  const formatted = Number(amount).toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  });
  
  return `S$${formatted}`;
};

/**
 * Format currency amount with prefix/suffix (flexible)
 * @param {number} amount - Amount to format
 * @param {string} prefix - Prefix (default: "S$")
 * @returns {string} Formatted currency string
 */
export const formatPrice = (amount, prefix = 'S$') => {
  if (amount === null || amount === undefined) return '—';
  return `${prefix}${Number(amount).toLocaleString()}`;
};

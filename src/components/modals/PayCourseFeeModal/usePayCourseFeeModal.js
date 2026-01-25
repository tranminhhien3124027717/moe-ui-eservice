import { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import paymentService from '../../../services/paymentService';
import { checkIsEducationAccount } from '../../../utils/authHelpers';
import { formatCurrency } from '../../../utils/formatters';

const PAYMENT_METHOD_ENUM = {
    AccountBalance: 0,
    CreditDebitCard: 1,
    BankTransfer: 2
};

const usePayCourseFeeModal = ({ open, invoiceId, onCancel }) => {
    const navigate = useNavigate();
    const isEducationAccount = checkIsEducationAccount();
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

    // --- STATE QUẢN LÝ ---
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    // Form State
    const [useBalance, setUseBalance] = useState(false);
    const [balanceAmount, setBalanceAmount] = useState(0); 
    const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'bank_transfer'
    
    // Validation State
    const [errorMessage, setErrorMessage] = useState(null); 

    // Payment Response State
    const [clientSecret, setClientSecret] = useState(null);
    const [qrData, setQrData] = useState(null);

    // --- INITIAL LOAD ---
    useEffect(() => {
        if (open && invoiceId) {
            fetchInvoiceDetails();
        } else {
            resetState();
        }
    }, [open, invoiceId]);

    const resetState = () => {
        setInvoiceData(null);
        setBalanceAmount(0);
        setUseBalance(false);
        setPaymentMethod("card");
        setClientSecret(null);
        setQrData(null);
        setProcessing(false);
        setErrorMessage(null);
    };

    const fetchInvoiceDetails = async () => {
        setLoading(true);
        try {
            const response = await paymentService.getInvoiceDetails(invoiceId);
            if (response && response.data) {
                const data = response.data;
                setInvoiceData(data);
                
                // Logic mặc định: Nếu có số dư > 0 thì auto tick và điền số max có thể
                if (isEducationAccount && data.balance > 0) {
                    setUseBalance(true);
                    setBalanceAmount(Math.min(data.amount, data.balance));
                } else {
                    setUseBalance(false);
                    setBalanceAmount(0);
                }
            } else {
                message.error("Failed to load invoice details");
                onCancel();
            }
        } catch (error) {
            console.error(error);
            onCancel();
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC TÍNH TOÁN (Computed Values) ---
    const amountDue = invoiceData ? invoiceData.amount : 0;
    const userBalance = invoiceData ? (invoiceData.balance || 0) : 0;
    const courseName = invoiceData ? (invoiceData.courseName || "COURSE") : "...";

    // Max số tiền được phép nhập (nhỏ nhất giữa Nợ và Ví)
    const maxAllowableBalance = Math.min(amountDue, userBalance);

    // Tính số tiền còn thiếu cần trả ngoài (External Amount)
    // Nếu đang bị lỗi nhập liệu (errorMessage != null), tạm tính external = full amount để an toàn
    const currentDeduction = (useBalance && !errorMessage) ? balanceAmount : 0;
    const externalAmount = Math.max(0, amountDue - currentDeduction);
    
    // Cờ báo hiệu có cần hiện phần thanh toán ngoài hay không
    const isExternalNeeded = externalAmount > 0;

    // --- HANDLERS (Xử lý sự kiện) ---
    
    // 1. Toggle Checkbox "Use Balance"
    const handleBalanceCheckboxChange = (checked) => {
        setUseBalance(checked);
        setErrorMessage(null); // Xóa lỗi cũ nếu có
        if (checked) {
            setBalanceAmount(maxAllowableBalance); // Auto fill max
        } else {
            setBalanceAmount(0);
        }
    };

    // 2. Change Input Amount (Có Validate)
    const handleBalanceAmountChange = (value) => {
        // Luôn cập nhật state để UI hiển thị đúng cái user gõ
        setBalanceAmount(value);

        if (value === null || value === undefined || value === '') {
            setErrorMessage("Please enter an amount");
            return;
        }

        // Validate: Nhập quá số dư ví
        if (value > userBalance) {
            setErrorMessage(`Exceeds your balance (${formatCurrency(userBalance)})`);
            return;
        }

        // Validate: Nhập quá số tiền hóa đơn
        if (value > amountDue) {
            setErrorMessage(`Cannot pay more than amount due (${formatCurrency(amountDue)})`);
            return;
        }

        // Validate: Số âm
        if (value < 0) {
            setErrorMessage("Amount cannot be negative");
            return;
        }

        // Hợp lệ
        setErrorMessage(null);
    };

    const handleMethodChange = (method) => {
        setPaymentMethod(method);
    };

    // --- XỬ LÝ SUBMIT & FIX LOGIC BIÊN ---
    const handleConfirm = async () => {
        // Chặn nếu đang xử lý hoặc đang có lỗi nhập liệu
        if (processing || errorMessage) return; 
        
        setProcessing(true);

        try {
            // [LOGIC QUAN TRỌNG]: Fix trường hợp biên user tick nhưng nhập 0
            
            // 1. Tính toán thực tế số tiền trừ ví
            // Nếu checkbox tắt HOẶC (checkbox bật nhưng nhập <= 0) -> Coi như là 0
            const actualBalanceAmount = (useBalance && balanceAmount > 0) ? balanceAmount : 0;
            
            // 2. Xác định cờ "Có dùng ví thật không?"
            const isActuallyUsingBalance = actualBalanceAmount > 0;

            // 3. Tính toán lại số tiền trả ngoài thực tế
            const actualExternalAmount = Math.max(0, amountDue - actualBalanceAmount);
            const isActuallyUsingExternal = actualExternalAmount > 0;

            // 4. Quyết định Payment Method Enum gửi lên server
            let methodEnumValue;

            if (!isActuallyUsingExternal) {
                // Case A: Ví trả hết 100% -> Method là Balance
                methodEnumValue = PAYMENT_METHOD_ENUM.AccountBalance;
            } else {
                // Case B: Có trả tiền ngoài (Full hoặc Combine) -> Method là Card/Bank
                methodEnumValue = paymentMethod === 'card' 
                    ? PAYMENT_METHOD_ENUM.CreditDebitCard 
                    : PAYMENT_METHOD_ENUM.BankTransfer;
            }

            // 5. Tạo Payload chuẩn chỉ
            const payload = {
                invoiceId: invoiceId,
                isUseBalance: isActuallyUsingBalance, // True chỉ khi tiền > 0
                amountFromBalance: actualBalanceAmount,
                isUseExternal: isActuallyUsingExternal,
                paymentMethod: methodEnumValue
            };


            const response = await paymentService.createPayment(payload);

            if (response && response.success && response.data) {
                const data = response.data;
                handlePollingLogic(data); 
            } else {
                message.error(response?.message || "Payment creation failed.");
                setProcessing(false);
            }

        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || "An error occurred.");
            setProcessing(false);
        }
    };

    // Logic Polling kiểm tra trạng thái
    const handlePollingLogic = (data) => {
         const startPolling = () => {
             const pollInterval = setInterval(async () => {
                 try {
                     const statusResponse = await paymentService.checkInvoiceStatus(invoiceId);
                     if (statusResponse && statusResponse.success && statusResponse.data) {
                         const status = statusResponse.data;
                         // 1 = Success
                         if (status === 1) {
                             clearInterval(pollInterval);
                             onCancel();
                             navigate('/payment-result', { state: { invoiceId: invoiceId } });
                             return;
                         }
                         // 0 = Fail/Cancel
                         if (status === 0) {
                             clearInterval(pollInterval);
                             message.error('Payment Failed or Cancelled!');
                             setProcessing(false);
                             return;
                         }
                     }
                 } catch (error) {
                     console.error("[Polling] Error:", error);
                 }
             }, 3000);

             // Timeout an toàn sau 30s
             setTimeout(() => {
                 clearInterval(pollInterval);
                 setProcessing(false);
             }, 30000);
         };

         // Điều hướng dựa trên response tạo payment
         if (data.clientSecret && !data.qrCodeUrl) {
             // Stripe
             if (!stripeKey) { message.error("Missing Stripe config"); setProcessing(false); return; }
             setClientSecret(data.clientSecret);
             startPolling();
             setProcessing(false); // Dừng loading để hiện form Stripe
         } else if (data.qrCodeUrl) {
             // VietQR / Bank Transfer
             setQrData(data);
             startPolling();
             setProcessing(false); // Dừng loading để hiện QR
         } else {
             // Trả hết bằng ví (Success ngay lập tức)
             startPolling(); 
         }
    };

    const onPaymentCompleted = () => {
        onCancel();
        navigate(`/payment-result?invoiceId=${invoiceId}`);
    };

    return {
        // State
        loading, processing, invoiceData, isEducationAccount,
        useBalance, balanceAmount, paymentMethod, clientSecret, qrData,
        errorMessage, 
        
        // Computed
        amountDue, userBalance, courseName, 
        maxAllowableBalance, 
        externalAmount, isExternalNeeded, stripeKey,

        // Actions
        handleConfirm, onPaymentCompleted, 
        setClientSecret, setQrData,
        handleMethodChange, handleBalanceCheckboxChange, handleBalanceAmountChange
    };
};

export default usePayCourseFeeModal;
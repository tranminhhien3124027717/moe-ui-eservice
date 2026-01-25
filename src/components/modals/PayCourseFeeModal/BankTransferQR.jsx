import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Alert, Typography, Spin, Result } from 'antd';
import { ArrowLeftOutlined, LinkOutlined, LoadingOutlined, RedoOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import paymentService from '../../../services/paymentService'; 
import './BankTransferQR.scss';

const { Text } = Typography;

// Enum for Payment Status
const TRANSACTION_STATUS = {
    Hold: 0,
    Success: 1,
    Cancel: 2,
    Timeout: 3
};

const BankTransferQR = ({ qrData, onBack }) => {
    const navigate = useNavigate();
    const pollInterval = useRef(null);
    
    // Extract data
    const invoiceId = qrData?.invoiceId;
    
    // State
    const [currentStatus, setCurrentStatus] = useState(TRANSACTION_STATUS.Hold);

    /* ==========================================================================
       POLLING LOGIC
       - Checks the invoice status every 3 seconds.
       - Stops if payment is Success, Cancelled, or Timed out.
       ========================================================================== */
    useEffect(() => {
        const checkStatus = async () => {
            console.log(`[Polling] Checking invoice status for: ${invoiceId} at ${new Date().toLocaleTimeString()}`);
            
            try {
                if (!invoiceId) return;
                
                const response = await paymentService.checkInvoiceStatus(invoiceId);
                
                if (response && response.success && response.data) {
                    const apiStatus = response.data;
                    let statusEnum = TRANSACTION_STATUS.Hold;

                    // Map API status to Local Enum
                    if (apiStatus === 1) {
                        statusEnum = TRANSACTION_STATUS.Success;
                    } else if (apiStatus === 0) {
                        statusEnum = TRANSACTION_STATUS.Cancel;
                    }
                    
                    // If status changed from Hold, stop polling and update UI
                    if (statusEnum !== TRANSACTION_STATUS.Hold) {
                        clearInterval(pollInterval.current);
                        
                        if (statusEnum === TRANSACTION_STATUS.Success) {
                            message.success("Payment confirmed! Redirecting...");
                            navigate(`/payment-result?invoiceId=${invoiceId}`); 
                            return; 
                        }
                        setCurrentStatus(statusEnum);
                    }
                }
            } catch (error) {
                console.error("[Polling] Error:", error);
            }
        };

        // Start polling if we have an Invoice ID and status is still 'Hold'
        if (invoiceId && currentStatus === TRANSACTION_STATUS.Hold) {
            pollInterval.current = setInterval(checkStatus, 3000);
        }

        // Cleanup on unmount
        return () => {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
        };
    }, [invoiceId, currentStatus, navigate]);

    /* ==========================================================================
       RENDER: ERROR / TIMEOUT STATES
       ========================================================================== */
    
    // View 1: Transaction Cancelled / Failed
    if (currentStatus === TRANSACTION_STATUS.Cancel) {
        return (
            <div className="bank-transfer-result error-view">
                <Result
                    status="error"
                    title="Payment Failed"
                    subTitle="The transaction was cancelled or failed."
                    extra={[
                        <Button type="primary" key="retry" onClick={onBack}>Try Another Method</Button>
                    ]}
                />
            </div>
        );
    }

    // View 2: Transaction Timeout
    if (currentStatus === TRANSACTION_STATUS.Timeout) {
        return (
            <div className="bank-transfer-result timeout-view">
                <Result
                    status="warning"
                    title="Payment Timed Out"
                    subTitle="The payment session has expired."
                    extra={[
                        <Button type="primary" key="retry" icon={<RedoOutlined />} onClick={onBack}>
                            Create New Payment
                        </Button>
                    ]}
                />
            </div>
        );
    }

    /* ==========================================================================
       RENDER: MAIN QR DISPLAY (HOLD STATE)
       ========================================================================== */
    const expiryTime = qrData.expiresAt ? dayjs(qrData.expiresAt).format('HH:mm DD/MM/YYYY') : '';

    return (
        <div className="bank-transfer-container">
            {/* 1. Header: Back button & Amount */}
            <div className="qr-header">
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} className="back-btn">
                    Change Method
                </Button>
                <div className="amount-display">
                    <span className="label">Total to pay:</span>
                    <span className="value">${qrData.amount?.toLocaleString()}</span>
                </div>
            </div>

            {/* 2. Status Alert */}
            <Alert 
                message={<span>Waiting for payment... <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} /></span>}
                description={expiryTime ? `Expires at ${expiryTime}. Keep this window open.` : ''}
                type="info" 
                showIcon={false} 
                className="status-alert"
            />

            {/* 3. QR Code Display */}
            <div className="qr-box">
                {qrData.qrCodeUrl ? (
                    <div className="qr-image-wrapper">
                        <img src={qrData.qrCodeUrl} alt="QR Code" className="qr-image" />
                        <div className="scan-text">Scan with Banking App</div>
                    </div>
                ) : (
                    <div className="qr-error">QR Not Available</div>
                )}
            </div>

            {/* 4. External Instructions Link */}
            <div className="transfer-details">
                {qrData.hostedInstructionsUrl ? (
                    <div className="instruction-wrapper">
                        <Text type="secondary" className="instruction-hint">
                            Having trouble scanning?
                        </Text>
                        <Button 
                            type="dashed" 
                            href={qrData.hostedInstructionsUrl} 
                            target="_blank" 
                            icon={<LinkOutlined />}
                            block
                            className="btn-instructions"
                        >
                            View instructions on Stripe
                        </Button>
                    </div>
                ) : (
                    <div className="instruction-wrapper">
                        <Text type="secondary" className="instruction-hint">
                            Please verify the amount before confirming payment.
                        </Text>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BankTransferQR;
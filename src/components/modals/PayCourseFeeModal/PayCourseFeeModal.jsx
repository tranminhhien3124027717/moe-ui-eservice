import React from 'react';
import { Modal, Checkbox, InputNumber, Button, Spin, Tag, Divider, Typography } from 'antd';
import { CloseOutlined, CreditCardOutlined, QrcodeOutlined, ArrowLeftOutlined, WalletOutlined, InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import StripePaymentForm from './StripePaymentForm';
import BankTransferQR from './BankTransferQR';
import usePayCourseFeeModal from './usePayCourseFeeModal';
import { formatCurrency } from '../../../utils/formatters';
import './PayCourseFeeModal.scss';

const { Text } = Typography;

const PayCourseFeeModal = ({ open, onCancel, invoiceId }) => {
    // --- Hook Integration ---
    const {
        loading, processing, invoiceData, useBalance, balanceAmount, paymentMethod,
        clientSecret, qrData, isEducationAccount,
        amountDue, userBalance, courseName, 
        maxAllowableBalance,
        externalAmount, isExternalNeeded,
        errorMessage, 
        handleConfirm, onPaymentCompleted, setClientSecret, setQrData,
        handleMethodChange, handleBalanceCheckboxChange, handleBalanceAmountChange, stripeKey
    } = usePayCourseFeeModal({ open, invoiceId, onCancel });

    const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

    /**
     * Renders the main content of the modal based on the current state.
     * State flow: Main Form -> (Confirm) -> Stripe Form / QR Code -> (Success)
     */
    const renderContent = () => {
        
        /* -------------------------------------------------------------------------
         * VIEW 1: STRIPE PAYMENT FORM
         * Rendered when clientSecret is present (after hitting confirm for Card)
         * ------------------------------------------------------------------------- */
        if (clientSecret && stripePromise) {
            return (
                <div className="stripe-wrapper" style={{ padding: '10px 0' }}>
                    <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => setClientSecret(null)} disabled={processing}>
                            Change Method
                        </Button>
                        <span style={{ fontWeight: 700, fontSize: 16, color: '#0f766e' }}>
                            Pay {formatCurrency(externalAmount)}
                        </span>
                    </div>
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                        <StripePaymentForm 
                            onSuccess={onPaymentCompleted} 
                            onCancel={() => setClientSecret(null)} 
                            amount={externalAmount} 
                            returnUrl={`${window.location.origin}/payment-result?invoiceId=${invoiceId}`}
                        />
                    </Elements>
                </div>
            );
        }

        /* -------------------------------------------------------------------------
         * VIEW 2: BANK TRANSFER QR CODE
         * Rendered when qrData is present (after hitting confirm for Bank Transfer)
         * ------------------------------------------------------------------------- */
        if (qrData) {
            return <BankTransferQR qrData={qrData} onPaid={onPaymentCompleted} onBack={() => setQrData(null)} />;
        }

        /* -------------------------------------------------------------------------
         * VIEW 3: MAIN SELECTION FORM
         * Default view: Balance selection + External method selection + Summary
         * ------------------------------------------------------------------------- */
        return (
            <>
                {/* --- Header Information --- */}
                <div className="modal-header-center">
                    <div className="course-name">{courseName}</div>
                    <div className="amount-due">{formatCurrency(amountDue)}</div>
                </div>

                <div className="payment-options-container">
                    
                    {/* --- Section A: Account Balance --- */}
                    {isEducationAccount && (
                        <>
                            {userBalance > 0 ? (
                                // State A1: Balance Available -> Active Input Form
                                <div className={`balance-card ${errorMessage ? 'has-error' : useBalance ? 'is-active' : ''}`}>
                                    <div className="balance-header">
                                        <Checkbox 
                                            className="balance-checkbox"
                                            checked={useBalance} 
                                            onChange={(e) => handleBalanceCheckboxChange(e.target.checked)}
                                            disabled={processing}
                                        >
                                            <span className="checkbox-label">
                                                <WalletOutlined className="icon"/> Use Account Balance
                                            </span>
                                        </Checkbox>
                                        <Tag color="green">{formatCurrency(userBalance)} available</Tag>
                                    </div>

                                    {useBalance && (
                                        <div className="balance-input-area">
                                            <div className="input-label-row">
                                                <span>Amount to deduct:</span>
                                                {!errorMessage && <span>Max: {formatCurrency(maxAllowableBalance)}</span>}
                                            </div>
                                            <InputNumber
                                                className="custom-input-number"
                                                value={balanceAmount}
                                                onChange={handleBalanceAmountChange}
                                                min={0}
                                                disabled={processing}
                                                formatter={(value) => `S$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value.replace(/\S\$\s?|(,*)/g, '')}
                                                status={errorMessage ? "error" : ""}
                                            />
                                            {errorMessage && (
                                                <div className="error-text">
                                                    <ExclamationCircleOutlined /> {errorMessage}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // State A2: Balance Empty -> Informative Card
                                <div className="empty-balance-card">
                                    <div className="icon-circle">
                                        <WalletOutlined />
                                    </div>
                                    <div className="text-content">
                                        <span className="main-text">Account Balance is empty</span>
                                        <span className="sub-text">Please select a payment method below.</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* --- Section B: External Payment Methods --- */}
                    {/* Only shown if there is a remaining amount and no input errors */}
                    {isExternalNeeded && !errorMessage ? (
                        <div className="external-section">
                            <Divider className="section-divider">Payment Method</Divider>
                            
                            <div className="method-grid">
                                <div 
                                    className={`method-option ${paymentMethod === 'card' ? 'is-selected' : ''}`} 
                                    onClick={() => !processing && handleMethodChange('card')}
                                    style={{ cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }}
                                >
                                    <CreditCardOutlined className="icon" /> 
                                    <span className="label">Credit Card</span>
                                </div>
                                <div 
                                    className={`method-option ${paymentMethod === 'bank_transfer' ? 'is-selected' : ''}`} 
                                    onClick={() => !processing && handleMethodChange('bank_transfer')}
                                    style={{ cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }}
                                >
                                    <QrcodeOutlined className="icon" /> 
                                    <span className="label">Bank Transfer</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Show "Fully Covered" message if balance covers everything and no error
                        !errorMessage && amountDue > 0 && (
                            <div className="fully-covered-msg">
                                <InfoCircleOutlined className="icon" />
                                <span className="text">Fully covered by Account Balance.</span>
                            </div>
                        )
                    )}
                </div>

                {/* --- Section C: Payment Summary Breakdown --- */}
                <div className="payment-summary-breakdown">
                    <div className="summary-row">
                        <span>Course Fee</span>
                        <span className="val">{formatCurrency(amountDue)}</span>
                    </div>

                    {useBalance && balanceAmount > 0 && !errorMessage && (
                        <div className="summary-row wallet-row">
                            <span><WalletOutlined /> From Wallet</span>
                            <span className="val">- {formatCurrency(balanceAmount)}</span>
                        </div>
                    )}

                    {isExternalNeeded && !errorMessage && (
                        <div className="summary-row external-row">
                            <span>
                                {paymentMethod === 'card' ? <CreditCardOutlined /> : <QrcodeOutlined />} External Payment
                            </span>
                            <span className="val">{formatCurrency(externalAmount)}</span>
                        </div>
                    )}

                    <Divider className="summary-divider" />

                    <div className={`total-row ${errorMessage ? 'is-disabled' : ''}`}>
                        <span className="label">Total Payment</span>
                        <span className="amount">
                            {errorMessage ? '--' : formatCurrency(balanceAmount + externalAmount)}
                        </span>
                    </div>
                </div>

                {/* --- Section D: Sticky Footer Actions --- */}
                <div className="footer-actions">
                    <Button className="btn-cancel" onClick={onCancel} disabled={processing}>
                        Cancel
                    </Button>
                    <Button 
                        className={`btn-confirm ${errorMessage ? 'is-error-state' : ''}`}
                        onClick={handleConfirm} 
                        disabled={!!errorMessage || processing}
                    >
                        {isExternalNeeded ? 'Proceed to Pay' : 'Confirm Payment'}
                    </Button>
                </div>
            </>
        );
    };

    // --- Global Loading Logic ---
    // Combine initial data loading and transaction processing state
    const isGlobalLoading = loading || processing;
    const loadingTip = loading ? "Loading Invoice..." : "Processing Payment...";

    return (
        <Modal 
            open={open} onCancel={onCancel} footer={null} width={480}
            className="payModal" closeIcon={<CloseOutlined />} centered
            title={clientSecret ? "Secure Card Payment" : (qrData ? "Scan to Pay" : "Payment Details")}
            maskClosable={!processing} // Prevent closing while processing
            closable={!processing}     // Hide close button while processing
        >
             <Spin spinning={isGlobalLoading} tip={loadingTip} size="large">
                {/* Fade content slightly when global loading is active */}
                <div style={{ opacity: isGlobalLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                    {invoiceData && renderContent()}
                </div>
            </Spin>
        </Modal>
    )
};

export default PayCourseFeeModal;
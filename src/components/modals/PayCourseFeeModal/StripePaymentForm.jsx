import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, message } from 'antd';
import './StripePaymentForm.scss'; 

const StripePaymentForm = ({ onSuccess, onCancel, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  // Local state for handling payment processing status and errors
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  /* ==========================================================================
     HANDLE SUBMIT
     - Triggered when the user clicks "Pay".
     - Confirms the payment intent with Stripe.
     ========================================================================== */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    // 1. Lock the form UI
    setIsPaying(true);
    setErrorMessage(null);

    // 2. Confirm Payment via Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is required for redirects
        return_url: window.location.href, 
      },
      // 'if_required': Only redirect if necessary. Otherwise, resolve promise.
      redirect: 'if_required', 
    });

    // 3. Handle Result
    if (error) {
      // Show error (e.g., Card Declined) and unlock form
      setErrorMessage(error.message);
      setIsPaying(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Success -> Notify parent
      message.success("Payment successful!");
      onSuccess(); 
    } else {
      // Processing state
      message.info("Payment processing...");
      onSuccess();
    }
  };

  return (
    <form className="stripe-payment-form" onSubmit={handleSubmit}>
      
      {/* ==========================================================================
        1. STRIPE ELEMENT CONTAINER
        - Contains the credit card inputs (iframe).
        - Logic: Adds 'is-disabled' class during processing to block interactions.
        ========================================================================== 
      */}
      <div className={`stripe-element-container ${isPaying ? 'is-disabled' : ''}`}>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      
      {/* ==========================================================================
        2. ERROR MESSAGE DISPLAY
        ========================================================================== 
      */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      {/* ==========================================================================
        3. FOOTER ACTIONS
        - Buttons are disabled/loading during payment processing.
        ========================================================================== 
      */}
      <div className="form-footer">
        <Button 
            className="btnCancel" 
            onClick={onCancel} 
            disabled={isPaying} // Lock cancel button
        >
            Cancel
        </Button>
        <Button 
            type="primary" 
            htmlType="submit" 
            className="btnPay" 
            loading={isPaying}  // Show spinner and lock button
            disabled={!stripe || !elements}
        >
            Pay ${amount?.toLocaleString()}
        </Button>
      </div>
    </form>
  );
};

export default StripePaymentForm;
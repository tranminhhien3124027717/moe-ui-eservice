import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Input, Form } from 'antd';
import { MailOutlined, EditOutlined, SaveOutlined, PhoneOutlined } from '@ant-design/icons';
import styles from '../UserProfile.module.scss';

const ContactAddressSection = ({ profileData, onUpdate }) => {
  /* ==========================================================================
     STATE & HOOKS
     ========================================================================== */
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  /* ==========================================================================
     HELPER: PHONE FORMATTING
     - Logic: Strips '+65' prefix for display, will be added back on save.
     - Purpose: User only edits the 8-digit number part.
     ========================================================================== */
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleanPhone = phone.toString().trim();
    
    // Remove +65 prefix if present
    if (cleanPhone.startsWith('+65')) {
        cleanPhone = cleanPhone.substring(3).trim();
    } else if (cleanPhone.startsWith('65') && cleanPhone.length > 8) {
        // Edge case: starts with 65 but isn't a country code
        cleanPhone = cleanPhone.substring(2).trim();
    }
    // Return without +65 prefix
    return cleanPhone;
  };

  /* ==========================================================================
     INITIAL FORM VALUES
     - Hydrates the form with profile data.
     - Applies phone formatting immediately.
     ========================================================================== */
  const initialValues = {
    email: profileData?.emailAddress || '',
    phone: profileData?.phoneNumber ? formatPhoneNumber(profileData?.phoneNumber) : '', // Shows only 8 digits
    registeredAddress: profileData?.registeredAddress || '',
    mailingAddress: profileData?.mailingAddress || ''
  };

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [profileData]);

  /* ==========================================================================
     VALIDATION RULES
     - Centralized validation logic for form fields.
     ========================================================================== */
  const validationRules = {
    email: [
      { required: true, message: 'Please enter your email address.' },
      { type: 'email', message: 'Invalid email format (e.g., user@example.com).' }
    ],
    phone: [
      { required: true, message: 'Please enter your contact number.' },
      {
        // Regex Explanation:
        // ^[689]  : Must start with 6, 8, or 9 (Singapore standard)
        // \d{7}   : Followed by exactly 7 digits (total 8 digits)
        pattern: /^[689]\d{7}$/,
        message: 'Contact number must be a valid 8-digit Singapore number (e.g., 81234567, 91234567).'
      }
    ],
    address: [
      { required: true, message: 'This address field cannot be empty.' },
      { min: 10, message: 'Address is too short. Please enter at least 10 characters.' },
      { max: 200, message: 'Address is too long. Maximum 200 characters allowed.' }
    ]
  };

  /* ==========================================================================
     HANDLERS
     ========================================================================== */
  const handleSave = async () => {
    try {
      // 1. Validate fields against rules
      const values = await form.validateFields();
      setLoading(true);
      
      // 2. Add +65 prefix to phone before sending to backend
      const updatedValues = {
        ...values,
        phone: values.phone ? `+65${values.phone}` : ''
      };
      
      // 3. Call parent update function
      const success = await onUpdate(updatedValues);
      
      // 3. Exit edit mode on success
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.profileCard} variant="borderless">
      {/* -------------------------------------------------------------------------
          HEADER SECTION
      -------------------------------------------------------------------------- */}
      <div className={`${styles.cardHeader} ${styles.isBordered}`}>
        <div className={styles.headerLeft}>
          <div className={styles.iconContainer} style={{ backgroundColor: '#e6fffa' }}> 
            <MailOutlined style={{ color: '#117a65' }} />
          </div>
          <div className={styles.headerContent}>
            <h3>Contact & Address Information</h3>
            <span>{isEditing ? 'Edit your contact details' : 'Your contact and address details'}</span>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          {!isEditing && (
            <Button className={styles.btnEdit} icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          BODY SECTION: FORM FIELDS
      -------------------------------------------------------------------------- */}
      <div className={styles.cardContent}>
        <Form form={form} initialValues={initialValues} layout="vertical">
          <Row gutter={[48, 24]}>
            {/* Email Field */}
            <Col xs={24} md={12}>
              <FormItemOrView 
                isEditing={isEditing} 
                name="email" 
                label="Email Address" 
                value={initialValues.email} 
                rules={validationRules.email} 
                prefixIcon={<MailOutlined style={{ color: '#9ca3af' }} />} 
              />
            </Col>
            {/* Phone Field */}
            <Col xs={24} md={12}>
              <FormItemOrView 
                isEditing={isEditing} 
                name="phone" 
                label="Phone Number" 
                value={initialValues.phone}
                rules={validationRules.phone} 
                prefixIcon={<PhoneOutlined style={{ color: '#9ca3af', transform: 'rotate(90deg)' }} />}
                addonBefore="+65"
              />
            </Col>
          </Row>

          <div style={{ height: 24 }}></div> 

          <Row gutter={[48, 24]}>
            {/* Registered Address */}
            <Col xs={24} md={12}>
              <FormItemOrView 
                isEditing={isEditing} 
                name="registeredAddress" 
                label="Registered Address" 
                value={initialValues.registeredAddress} 
                rules={validationRules.address} 
                isTextArea 
              />
            </Col>
            {/* Mailing Address */}
            <Col xs={24} md={12}>
              <FormItemOrView 
                isEditing={isEditing} 
                name="mailingAddress" 
                label="Mailing Address" 
                value={initialValues.mailingAddress} 
                rules={validationRules.address} 
                isTextArea 
              />
            </Col>
          </Row>

          {/* Form Actions (Save/Cancel) */}
          {isEditing && (
            <div className={styles.formFooter}>
              <Button size="large" className={styles.btnCancel} onClick={() => setIsEditing(false)} disabled={loading}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                size="large" 
                className={styles.btnSave} 
                onClick={handleSave} 
                icon={<SaveOutlined />} 
                loading={loading}
              >
                Save Changes
              </Button>
            </div>
          )}
        </Form>
      </div>
    </Card>
  );
};

/* ==========================================================================
   SUB-COMPONENT: FormItemOrView
   - Renders Input (Edit Mode) or Static Text (View Mode) 
   ========================================================================== */
const FormItemOrView = ({ isEditing, name, label, value, isTextArea = false, prefixIcon, addonBefore, rules = [] }) => {
  if (isEditing) {
    return (
      <Form.Item 
        name={name} 
        label={label} 
        rules={rules} // Pass validation rules
        validateTrigger={['onChange', 'onBlur']} 
      >
        {isTextArea ? (
          <Input.TextArea rows={2} placeholder={`Enter ${label}`} />
        ) : (
          <Input size="large" prefix={prefixIcon} addonBefore={addonBefore} placeholder={`Enter ${label}`} />
        )}
      </Form.Item>
    );
  }
  // In view mode, show with +65 prefix if addonBefore is provided
  const displayValue = addonBefore && value ? `${addonBefore}${value}` : value;
  return (
    <div className={styles.infoField}>
      <label>{label}</label>
      <div className={`${styles.value} ${styles.valueBold}`}>{displayValue}</div>
    </div>
  );
};

export default ContactAddressSection;
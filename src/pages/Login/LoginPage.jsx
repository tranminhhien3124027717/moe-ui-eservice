import React, { useState } from 'react';
import { Button, Form, Input, message, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import EduLogo from '../../assets/icon/EduLogo.jsx';
import styles from './LoginPage.module.scss';
import authService from '../../services/authService';

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  /* ==========================================================================
     HANDLE LOGIN SUBMISSION
     - Sends credentials to the server.
     - Handles specific error cases (401, 403, 500, Network Error).
     ========================================================================== */
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await authService.login({
        username: values.username,
        password: values.password
      });

      // 1. Success Case
      if (response && response.token) {
        // Store auth token & user data
        localStorage.setItem('accessToken', response.token);
        
        const userData = {
          id: response.educationAccountId,
          accountid: response.accountHolderId,
          fullName: response.fullName,
          email: response.email,
          nric: response.nric,
          expiresAt: response.expiresAt,
          isEducationAccount: response.isEducationAccount
        };
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        message.success(`Welcome back, ${response.fullName}!`);
        navigate('/dashboard');
      } else {
        // Edge case: Server returns 200 OK but missing token
        message.warning('Login successful but no token received. Please contact support.');
      }

    } catch (error) {
      console.error("Login Error Details:", error);

      // 2. Error Handling Logic
      let errorMsg = 'An unexpected error occurred. Please try again.';
      
      if (error.response) {
        // Case A: Server responded with an error status code
        const { status, data } = error.response;
        
        switch (status) {
          case 400: // Bad Request (Missing fields, invalid format)
            errorMsg = data?.message || 'Invalid request. Please check your inputs.';
            break;
          case 401: // Unauthorized (Wrong credentials)
            errorMsg = 'Incorrect username or password.';
            break;
          case 403: // Forbidden (Account locked/disabled)
            errorMsg = 'Your account has been locked or disabled. Please contact admin.';
            break;
          case 404: // Not Found
            errorMsg = 'User account not found.';
            break;
          case 500:
          case 502:
          case 503: // Server Errors
            errorMsg = 'Server is currently unavailable. Please try again later.';
            break;
          default:
            errorMsg = data?.message || `Login failed (Error ${status})`;
        }
      } else if (error.request) {
        // Case B: No response received (Network Error / Server Down)
        errorMsg = 'Unable to connect to server. Please check your internet connection.';
      } else {
        // Case C: Request setup error
        errorMsg = error.message;
      }

      // Display the refined error message
      message.error(errorMsg);

    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================================
     RENDER UI
     ========================================================================== */
  return (
    <div className={styles.loginContainer}>
      
      {/* --- Left Panel: Branding & Hero Image --- */}
      <div className={styles.leftPanel}>
        <div className={styles.brandOverlay}>
          <div className={styles.brandContent}>
            <div className={styles.logoBadge}>
              <EduLogo width={40} height={40} />
              <span>Account Portal</span>
            </div>

            <Title level={1} className={styles.heroTitle}>
              Manage your courses  <br />
              <span className={styles.highlight}>& make payments</span>
            </Title>

            <Text className={styles.heroSubtitle}>
              The EduCredit portal allows you to see your enrolled courses and perform payments easily.
            </Text>
          </div>
        </div>
      </div>

      {/* --- Right Panel: Login Form --- */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          
          {/* Form Header */}
          <div className={styles.formHeader}>
            {/* Mobile Logo (Visible only on small screens) */}
            <div className={styles.mobileLogo} onClick={() => navigate('/')}>
              <EduLogo width={48} height={48} />
            </div>
            <Title level={2} className={styles.welcomeTitle}>Welcome Back!</Title>
            <Text className={styles.welcomeSub}>Please enter your details to sign in.</Text>
          </div>

          {/* Form Inputs */}
          <Form
            name="login_form"
            className={styles.loginForm}
            initialValues={{ remember: true }}
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your Username!' }]}
            >
              <Input
                prefix={<UserOutlined className={styles.fieldIcon} />}
                placeholder="Username"
                className={styles.customInput}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.fieldIcon} />}
                placeholder="Password"
                className={styles.customInput}
              />
            </Form.Item>

            <div className={styles.formActions}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className={styles.customCheckbox}>Remember me</Checkbox>
              </Form.Item>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" className={styles.submitButton} loading={loading} block>
                Sign In <LoginOutlined />
              </Button>
            </Form.Item>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
import { 
  AppstoreOutlined, UserOutlined, WalletOutlined, 
  ReadOutlined, SettingOutlined, HomeOutlined, QuestionCircleOutlined 
} from '@ant-design/icons';

export const ADMIN_MENU = [
  { key: '/', icon: <AppstoreOutlined />, label: 'Dashboard' },
  { key: '/accounts', icon: <UserOutlined />, label: 'Account Management' },
  { key: '/topup', icon: <WalletOutlined />, label: 'Top-up Management' },
  { key: '/course', icon: <ReadOutlined />, label: 'Course Management' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
];

export const USER_MENU = [
  { key: '/dashboard', icon: <HomeOutlined />, label: 'Dashboard' },
  { key: '/balance', icon: <WalletOutlined />, label: 'Account Balance' },
  { key: '/courses', icon: <ReadOutlined />, label: 'Your Courses' },
  { key: '/profile', icon: <UserOutlined />, label: 'My Profile' },
];
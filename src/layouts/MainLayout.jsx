import React, { useState } from 'react';
import { Layout, Drawer, Button } from 'antd'; 
import { Outlet } from 'react-router-dom';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import Header from './Header/MainHeader.jsx';
import UserSidebar from './Sidebar/UserSidebar.jsx'; 
import './MainLayout.scss'; 

const { Sider, Content } = Layout;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Layout className="app-layout-main">
      <Header 
        toggleMobile={
          <div className="mobile-toggle-btn" onClick={() => setMobileOpen(true)}>
             <MenuOutlined />
          </div>
        } 
      />
      
      <Layout className="layout-content-wrapper">
        {/* SIDEBAR DESKTOP */}
        <Sider 
            width={260} 
            theme="light" 
            trigger={null} 
            className="layout-sider"
        >
            <UserSidebar />
        </Sider>

        {/* SIDEBAR MOBILE (DRAWER) */}
         <Drawer 
            title={<span style={{ fontWeight: 700, fontSize: 16 }}>Menu</span>}
            placement="left" 
            size={280}
            onClose={() => setMobileOpen(false)} 
            open={mobileOpen} 
            className="responsive-drawer"
            styles={{ body: { padding: 0 }, header: { borderBottom: '1px solid #f0f0f0'} }}
            closeIcon={<CloseOutlined style={{ fontSize: 18 }} />}
        >
            <UserSidebar onClose={() => setMobileOpen(false)} />
        </Drawer>

        {/* MAIN CONTENT */}
        <Content className="layout-content">
            <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
import React from 'react';
import { RouterProvider } from 'react-router-dom'; 
import { ConfigProvider } from 'antd';
import { router } from './routes/index'; 
import './assets/styles/main.scss';

function App() {
  return (
    <ConfigProvider theme={{ token: { fontFamily: 'Inter', colorPrimary: '#1e3a8a' } }}>
       <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
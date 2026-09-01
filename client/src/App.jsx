import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import GroundwaterMonitor from './pages/GroundwaterMonitor';
import BorewellManager from './pages/BorewellManager';
import RechargeStructures from './pages/RechargeStructures';
import ExtractionPatterns from './pages/ExtractionPatterns';
import AIInsights from './pages/AIInsights';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="app-layout">
      {!isLoginPage && (
        <>
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          <Navbar collapsed={collapsed} />
        </>
      )}

      <main className={!isLoginPage ? `main-content ${collapsed ? 'collapsed' : ''}` : 'w-full'}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/groundwater" element={<GroundwaterMonitor />} />
          <Route path="/borewells" element={<BorewellManager />} />
          <Route path="/recharge" element={<RechargeStructures />} />
          <Route path="/extraction" element={<ExtractionPatterns />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

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

/* Protected Route wrapper — redirects to login if not authenticated */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  // If on login page and already authenticated, redirect to dashboard
  if (isLoginPage && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-layout">
      {!isLoginPage && (
        <>
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          <Navbar collapsed={collapsed} />
        </>
      )}

      <main className={!isLoginPage ? `main-content ${collapsed ? 'collapsed' : ''}` : ''}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/groundwater" element={<ProtectedRoute><GroundwaterMonitor /></ProtectedRoute>} />
          <Route path="/borewells" element={<ProtectedRoute><BorewellManager /></ProtectedRoute>} />
          <Route path="/recharge" element={<ProtectedRoute><RechargeStructures /></ProtectedRoute>} />
          <Route path="/extraction" element={<ProtectedRoute><ExtractionPatterns /></ProtectedRoute>} />
          <Route path="/ai-insights" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

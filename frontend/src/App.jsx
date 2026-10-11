import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import FixedDeposits from './pages/FixedDeposits';
import InterestManagement from './pages/InterestManagement';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import Agents from './pages/Agents';
import Settings from './pages/Settings';
import './App.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { path: '/transactions', label: 'Transactions', icon: '⇄' },
    { path: '/accounts', label: 'Accounts', icon: '💳︎' },
    { path: '/fixed-deposits', label: 'Fixed Deposits', icon: '🔒︎' },
    { path: '/interest', label: 'Interest Engine', icon: '⏵︎' },
    { path: '/reports', label: 'Reports', icon: '📋︎' },
    { path: '/customers', label: 'Customers', icon: '👥︎' },
    { path: '/agents', label: 'Agents', icon: '👔︎' },
    { path: '/settings', label: 'Settings', icon: '⚙︎' },
  ];


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h2><span style={{ fontSize: '1.2em', marginRight: '8px' }}>🏦</span>B-Trust</h2>
          <p>Admin Portal</p>
        </Link>
      </div>

      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
            <Link to={item.path}>
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* User Info & Logout Button */}
      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <span className="user-avatar">👤︎</span>
          <span className="user-name">{user?.username || 'Admin'}</span>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign Out">
          🚪︎ Sign Out
        </button>
      </div>
    </nav>
  );
};

// Protected Layout for Dashboard & Portal Pages
const ProtectedLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page with Hero Section & Login */}
          <Route path="/" element={<Landing />} />

          {/* Protected Dashboard & Functional Banking Pages */}
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/transactions" element={<ProtectedLayout><Transactions /></ProtectedLayout>} />
          <Route path="/accounts" element={<ProtectedLayout><Accounts /></ProtectedLayout>} />
          <Route path="/fixed-deposits" element={<ProtectedLayout><FixedDeposits /></ProtectedLayout>} />
          <Route path="/interest" element={<ProtectedLayout><InterestManagement /></ProtectedLayout>} />
          <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
          <Route path="/customers" element={<ProtectedLayout><Customers /></ProtectedLayout>} />
          <Route path="/agents" element={<ProtectedLayout><Agents /></ProtectedLayout>} />
          <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />

          {/* Catch-all redirect to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

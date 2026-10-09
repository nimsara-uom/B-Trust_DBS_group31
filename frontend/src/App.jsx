import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
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
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/transactions', label: 'Transactions', icon: '💸' },
    { path: '/accounts', label: 'Accounts', icon: '🏦' },
    { path: '/fixed-deposits', label: 'Fixed Deposits', icon: '🔒' },
    { path: '/interest', label: 'Interest Engine', icon: '📈' },
    { path: '/reports', label: 'Reports', icon: '📋' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/agents', label: 'Agents', icon: '👔' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2>MIMS</h2>
        <p>Admin Portal</p>
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
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/fixed-deposits" element={<FixedDeposits />} />
            <Route path="/interest" element={<InterestManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

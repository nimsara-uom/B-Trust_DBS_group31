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
    { path: '/', label: 'Dashboard' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/accounts', label: 'Accounts' },
    { path: '/fixed-deposits', label: 'Fixed Deposits' },
    { path: '/interest', label: 'Interest Engine' },
    { path: '/reports', label: 'Reports' },
    { path: '/customers', label: 'Customers' },
    { path: '/agents', label: 'Agents' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="sidebar">
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

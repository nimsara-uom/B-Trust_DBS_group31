import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  ArrowRightLeft, 
  PiggyBank, 
  Calculator, 
  FileBarChart, 
  UserSquare2, 
  Settings,
  Bell,
  Search,
  LogOut,
  Building2
} from 'lucide-react';
import './DashboardLayout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/accounts', label: 'Savings Accounts', icon: Wallet },
  { path: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { path: '/fixed-deposits', label: 'Fixed Deposits', icon: PiggyBank },
  { path: '/interest', label: 'Interest Management', icon: Calculator },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
  { path: '/agents', label: 'Agents', icon: UserSquare2 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const DashboardLayout = () => {
  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Building2 className="brand-icon" size={32} />
          <div className="brand-text">
            <h2>People's Bank</h2>
            <span>Small Steps • Big Dreams</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">RS</div>
            <div className="user-info">
              <span className="user-name">Raveesha S.</span>
              <span className="user-role">Branch Manager</span>
            </div>
          </div>
          <button className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="topbar">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input type="text" placeholder="Search customers, accounts, transactions..." />
          </div>
          
          <div className="topbar-actions">
            <button className="notification-btn">
              <Bell size={22} />
              <span className="badge">3</span>
            </button>
            <div className="topbar-user">
              <div className="avatar">RS</div>
              <div className="user-info">
                <span className="user-name">Raveesha Sandamini</span>
                <span className="user-role">Branch Manager</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

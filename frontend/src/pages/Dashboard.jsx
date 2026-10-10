import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { Wallet, Users, PiggyBank, ArrowUpRight, ArrowDownRight, RefreshCw, Plus, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_customers: 0,
    total_savings: 0,
    total_fds: 0,
    total_interest: 0,
    recent_transactions: [],
    chart_data: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to connect to backend server. Make sure FastAPI is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return 'Rs. ' + Number(val || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div>
          <h1><span>B-Trust</span></h1>
          <p>Microbanking & Interest Management System</p>
        </div>

      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600"><Users size={24} /></div>
          <h3>Total Customers</h3>
          <div className="stat-value">{loading ? '...' : stats.total_customers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-600"><PiggyBank size={24} /></div>
          <h3>Total Savings Balance</h3>
          <div className="stat-value">{loading ? '...' : formatCurrency(stats.total_savings)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-yellow-100 text-yellow-600"><Wallet size={24} /></div>
          <h3>Active Fixed Deposits</h3>
          <div className="stat-value">{loading ? '...' : formatCurrency(stats.total_fds)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100 text-purple-600"><RefreshCw size={24} /></div>
          <h3>FD Interest Paid</h3>
          <div className="stat-value">{loading ? '...' : formatCurrency(stats.total_interest)}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-section card">
          <div className="card-header">
            <h3>Transaction Activity Trend</h3>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>Monthly Volumes</span>
          </div>
          <div className="chart-container">
            {stats.chart_data && stats.chart_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chart_data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7F8C8D', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7F8C8D', fontSize: 12 }} dx={-10} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="balance" stroke="#4A90E2" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#7F8C8D' }}>
                {loading ? 'Loading trend...' : 'No transaction data available yet.'}
              </div>
            )}
          </div>
        </div>

        <div className="quick-actions card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="actions-grid">
            <Link to="/transactions" className="action-btn" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ArrowUpRight className="text-green-500" /> Deposit
            </Link>
            <Link to="/transactions" className="action-btn" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ArrowDownRight className="text-purple-500" /> Withdraw
            </Link>
            <Link to="/accounts" className="action-btn" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Plus className="text-pink-500" /> Open Savings
            </Link>
            <Link to="/fixed-deposits" className="action-btn" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Wallet className="text-yellow-500" /> Open FD
            </Link>
            <Link to="/customers" className="action-btn" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Users className="text-blue-500" /> Register Customer
            </Link>
            <Link to="/interest-management" className="action-btn" style={{ textDecoration: 'none', color: 'inherit' }}>
              <RefreshCw className="text-slate-500" /> Run Engine
            </Link>
          </div>
        </div>
      </div>

      <div className="recent-transactions card mt-6">
        <div className="card-header">
          <h3>Recent Transactions</h3>
          <Link to="/transactions" className="view-all">View All <ChevronRight size={16} /></Link>
        </div>
        <div className="transaction-list">
          {loading ? (
            <div style={{ padding: '1rem', color: '#7F8C8D' }}>Loading recent transactions...</div>
          ) : stats.recent_transactions && stats.recent_transactions.length > 0 ? (
            stats.recent_transactions.map(txn => {
              const isDeposit = txn.transaction_type === 'Deposit';
              const isInterest = txn.transaction_type === 'FD_Interest';
              return (
                <div key={txn.transaction_id} className="transaction-item">
                  <div className={`txn-icon ${isDeposit ? 'bg-green-100 text-green-600' : isInterest ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                    {isDeposit || isInterest ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div className="txn-details">
                    <h4>{txn.transaction_type} {txn.account_number ? `(${txn.account_number})` : ''}</h4>
                    <span>Ref: {txn.reference_no} • {formatDate(txn.transaction_timestamp)}</span>
                  </div>
                  <div className={`txn-amount ${isDeposit || isInterest ? 'text-green-600' : 'text-red-600'}`}>
                    {isDeposit || isInterest ? '+ ' : '- '}{formatCurrency(txn.amount)}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '1rem', color: '#7F8C8D' }}>No recent transactions.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

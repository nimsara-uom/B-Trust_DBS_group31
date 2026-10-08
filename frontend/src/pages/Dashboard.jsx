import React from 'react';
import './Dashboard.css';
import { Wallet, Users, PiggyBank, ArrowUpRight, ArrowDownRight, RefreshCw, Send, Plus, CreditCard, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Feb', balance: 30000 },
  { name: 'Mar', balance: 45000 },
  { name: 'Apr', balance: 55000 },
  { name: 'May', balance: 50000 },
  { name: 'Jun', balance: 65000 },
  { name: 'Jul', balance: 80000 },
];

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div>
          <h1>Good Morning, <br/><span>Raveesha Sandamini</span> 👋</h1>
          <p>Your financial journey, our priority.</p>
        </div>
        <div className="banner-art">
          <span>Save Today<br/>Grow Tomorrow</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600"><Users size={24} /></div>
          <h3>Total Customers</h3>
          <div className="stat-value">1,245</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-600"><PiggyBank size={24} /></div>
          <h3>Total Savings</h3>
          <div className="stat-value">Rs. 12,500,000.00</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-yellow-100 text-yellow-600"><Wallet size={24} /></div>
          <h3>Fixed Deposits</h3>
          <div className="stat-value">Rs. 4,250,000.00</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100 text-purple-600"><RefreshCw size={24} /></div>
          <h3>Interest Paid</h3>
          <div className="stat-value">Rs. 345,000.00</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-section card">
          <div className="card-header">
            <h3>Transaction Overview</h3>
            <select className="date-select"><option>Last 6 Months</option></select>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#7F8C8D', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#7F8C8D', fontSize: 12}} dx={-10} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="balance" stroke="#4A90E2" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="quick-actions card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="actions-grid">
            <button className="action-btn"><ArrowUpRight className="text-green-500" /> Deposit</button>
            <button className="action-btn"><ArrowDownRight className="text-purple-500" /> Withdraw</button>
            <button className="action-btn"><Send className="text-blue-500" /> Transfer</button>
            <button className="action-btn"><Plus className="text-pink-500" /> Open Savings</button>
            <button className="action-btn"><CreditCard className="text-yellow-500" /> Apply Loan</button>
            <button className="action-btn"><RefreshCw className="text-slate-500" /> Run Engine</button>
          </div>
        </div>
      </div>
      
      <div className="recent-transactions card mt-6">
        <div className="card-header">
          <h3>Recent Transactions</h3>
          <a href="/transactions" className="view-all">View All <ChevronRight size={16}/></a>
        </div>
        <div className="transaction-list">
          {[
            { id: 1, title: 'Cash Deposit', date: '28 Jul 2026', amount: '+ Rs. 5,000.00', type: 'deposit' },
            { id: 2, title: 'Cash Withdrawal', date: '26 Jul 2026', amount: '- Rs. 2,000.00', type: 'withdrawal' },
            { id: 3, title: 'Interest Credit', date: '24 Jul 2026', amount: '+ Rs. 450.00', type: 'deposit' }
          ].map(txn => (
            <div key={txn.id} className="transaction-item">
              <div className={`txn-icon ${txn.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {txn.type === 'deposit' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>
              <div className="txn-details">
                <h4>{txn.title}</h4>
                <span>{txn.date}</span>
              </div>
              <div className={`txn-amount ${txn.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                {txn.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

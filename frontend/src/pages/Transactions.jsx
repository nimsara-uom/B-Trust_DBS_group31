import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Filter, Search } from 'lucide-react';
import './Transactions.css';

const MOCK_TRANSACTIONS = [
  { id: 'TXN-9081', account: 'SV-49321', customer: 'Nimal Perera', type: 'Deposit', amount: '+ Rs. 15,000.00', balanceAfter: 'Rs. 52,000.00', agent: 'Agent 001', date: '28 Jul 2026 10:30 AM', status: 'Success' },
  { id: 'TXN-9082', account: 'SV-78310', customer: 'Kamal Silva', type: 'Withdrawal', amount: '- Rs. 2,000.00', balanceAfter: 'Rs. 118,250.00', agent: 'Agent 002', date: '28 Jul 2026 11:15 AM', status: 'Success' },
  { id: 'TXN-9083', account: 'SV-23094', customer: 'Saman Kumara', type: 'Interest_Credit', amount: '+ Rs. 4,500.00', balanceAfter: 'Rs. 454,500.00', agent: 'System', date: '27 Jul 2026 00:01 AM', status: 'Success' },
  { id: 'TXN-9084', account: 'SV-49321', customer: 'Nimal Perera', type: 'Withdrawal', amount: '- Rs. 50,000.00', balanceAfter: 'Rs. 52,000.00', agent: 'Agent 001', date: '26 Jul 2026 14:20 PM', status: 'Failed' },
];

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Transactions</h2>
          <p>Monitor and process deposits and withdrawals</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline text-purple-600 border-purple-200" onClick={() => setIsWithdrawModalOpen(true)}>
            <ArrowDownRight size={18} /> Process Withdrawal
          </button>
          <button className="btn-primary" onClick={() => setIsDepositModalOpen(true)}>
            <ArrowUpRight size={18} /> Process Deposit
          </button>
        </div>
      </div>

      <div className="card table-card">
        <div className="tabs-container">
          {['All', 'Deposits', 'Withdrawals', 'Interest', 'Fixed Deposits', 'Rollbacks'].map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="table-toolbar">
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search transactions..." />
          </div>
          <button className="btn-outline"><Filter size={18} /> Filters</button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Account</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Agent</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map(txn => (
                <tr key={txn.id}>
                  <td className="font-medium text-slate-500">{txn.id}</td>
                  <td className="font-medium">{txn.account}</td>
                  <td>{txn.customer}</td>
                  <td>
                    <span className="type-indicator">
                      {txn.type === 'Deposit' && <ArrowUpRight size={14} className="text-green-600" />}
                      {txn.type === 'Withdrawal' && <ArrowDownRight size={14} className="text-purple-600" />}
                      {txn.type === 'Interest_Credit' && <RefreshCw size={14} className="text-blue-600" />}
                      {txn.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`font-medium ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-purple-600'}`}>
                    {txn.amount}
                  </td>
                  <td>{txn.balanceAfter}</td>
                  <td>{txn.agent}</td>
                  <td>{txn.date}</td>
                  <td>
                    <span className={`badge ${txn.status === 'Success' ? 'badge-success' : 'badge-error'}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Process Cash Deposit</h3>
              <button className="close-btn" onClick={() => setIsDepositModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="form-grid">
                <div className="form-group col-span-2">
                  <label>Customer Account</label>
                  <select>
                    <option>Search account number or NIC...</option>
                    <option>SV-49321 - Nimal Perera</option>
                  </select>
                </div>
                <div className="form-group col-span-2">
                  <label>Deposit Amount (LKR)</label>
                  <div className="amount-input-wrapper">
                    <span className="currency">Rs.</span>
                    <input type="number" placeholder="0.00" className="amount-input" />
                  </div>
                </div>
                <div className="form-group col-span-2">
                  <label>Description / Reference Note</label>
                  <input type="text" placeholder="Optional reference note" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setIsDepositModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setIsDepositModalOpen(false)}>Confirm Deposit</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Process Cash Withdrawal</h3>
              <button className="close-btn" onClick={() => setIsWithdrawModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert-box warning mb-4">
                <strong>Important:</strong> Check customer identity before processing withdrawals. System will block overdrafts automatically.
              </div>
              <form className="form-grid">
                <div className="form-group col-span-2">
                  <label>Customer Account</label>
                  <select>
                    <option>Search account number or NIC...</option>
                    <option>SV-49321 - Nimal Perera (Balance: Rs. 52,000.00)</option>
                  </select>
                </div>
                <div className="form-group col-span-2">
                  <label>Withdrawal Amount (LKR)</label>
                  <div className="amount-input-wrapper">
                    <span className="currency">Rs.</span>
                    <input type="number" placeholder="0.00" className="amount-input text-purple-600" />
                  </div>
                </div>
                <div className="form-group col-span-2">
                  <label>Reference Note</label>
                  <input type="text" placeholder="Withdrawal slip number" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setIsWithdrawModalOpen(false)}>Cancel</button>
              <button className="btn-outline" style={{borderColor: 'var(--color-error)', color: 'var(--color-error)'}} onClick={() => setIsWithdrawModalOpen(false)}>Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

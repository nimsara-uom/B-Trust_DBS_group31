import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Filter, Search } from 'lucide-react';
import './Transactions.css';
import { getTransactions, depositMoney, withdrawMoney, getAccounts, getAgents } from '../api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [amount, setAmount] = useState('');
  const [refNo, setRefNo] = useState('');

  useEffect(() => {
    loadTransactions();
    loadMetadata();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTransactions();
      setTransactions(res.data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions from database.');
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [accRes, agentRes] = await Promise.all([
        getAccounts(),
        getAgents()
      ]);
      setAccounts(accRes.data || []);
      setAgents(agentRes.data || []);
      if (accRes.data && accRes.data.length > 0) {
        setSelectedAccountId(accRes.data[0].account_id);
      }
      if (agentRes.data && agentRes.data.length > 0) {
        setSelectedAgentId(agentRes.data[0].agent_id);
      }
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  };

  const openDeposit = () => {
    setAmount('');
    setRefNo(`DEP-${Date.now().toString().slice(-6)}`);
    setIsDepositModalOpen(true);
  };

  const openWithdrawal = () => {
    setAmount('');
    setRefNo(`WTH-${Date.now().toString().slice(-6)}`);
    setIsWithdrawModalOpen(true);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!selectedAccountId || !amount || !refNo) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      await depositMoney({
        account_id: parseInt(selectedAccountId),
        agent_id: parseInt(selectedAgentId || 1),
        amount: parseFloat(amount),
        reference_no: refNo.trim()
      });
      setIsDepositModalOpen(false);
      loadTransactions();
    } catch (err) {
      console.error('Deposit error:', err);
      alert(err.response?.data?.detail || 'Failed to process deposit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!selectedAccountId || !amount || !refNo) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      await withdrawMoney({
        account_id: parseInt(selectedAccountId),
        agent_id: parseInt(selectedAgentId || 1),
        amount: parseFloat(amount),
        reference_no: refNo.trim()
      });
      setIsWithdrawModalOpen(false);
      loadTransactions();
    } catch (err) {
      console.error('Withdrawal error:', err);
      alert(err.response?.data?.detail || 'Failed to process withdrawal.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return 'Rs. ' + Number(val || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Filter tab logic
  const filteredTransactions = transactions.filter(txn => {
    if (activeTab === 'Deposits' && txn.transaction_type !== 'Deposit') return false;
    if (activeTab === 'Withdrawals' && txn.transaction_type !== 'Withdrawal') return false;
    if (activeTab === 'Interest' && txn.transaction_type !== 'FD_Interest') return false;
    if (activeTab === 'Fixed Deposits' && !txn.fd_id) return false;
    
    if (search) {
      const q = search.toLowerCase();
      const ref = (txn.reference_no || '').toLowerCase();
      const type = (txn.transaction_type || '').toLowerCase();
      const acc = String(txn.account_id || '');
      return ref.includes(q) || type.includes(q) || acc.includes(q);
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Transactions</h2>
          <p>Live transaction ledger and operations (ACID verified)</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline text-purple-600 border-purple-200" onClick={openWithdrawal}>
            <ArrowDownRight size={18} /> Process Withdrawal
          </button>
          <button className="btn-primary" onClick={openDeposit}>
            <ArrowUpRight size={18} /> Process Deposit
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="card table-card">
        <div className="tabs-container">
          {['All', 'Deposits', 'Withdrawals', 'Interest'].map(tab => (
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
            <input 
              type="text" 
              placeholder="Search by reference no, account ID or type..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-outline" onClick={loadTransactions}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Reference No</th>
                <th>Account ID</th>
                <th>Agent ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    Loading transactions from database...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    No transactions match your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(txn => {
                  const isDeposit = txn.transaction_type === 'Deposit';
                  const isInterest = txn.transaction_type === 'FD_Interest';
                  return (
                    <tr key={txn.transaction_id}>
                      <td className="font-medium text-slate-500">#{txn.transaction_id}</td>
                      <td className="font-medium">{txn.reference_no}</td>
                      <td>Account #{txn.account_id}</td>
                      <td>{txn.agent_id ? `Agent #${txn.agent_id}` : 'System Engine'}</td>
                      <td>
                        <span className="type-indicator">
                          {isDeposit && <ArrowUpRight size={14} className="text-green-600" />}
                          {!isDeposit && !isInterest && <ArrowDownRight size={14} className="text-purple-600" />}
                          {isInterest && <RefreshCw size={14} className="text-blue-600" />}
                          {txn.transaction_type}
                        </span>
                      </td>
                      <td className={`font-medium ${isDeposit || isInterest ? 'text-green-600' : 'text-purple-600'}`}>
                        {isDeposit || isInterest ? '+ ' : '- '}{formatCurrency(txn.amount)}
                      </td>
                      <td>{formatDateTime(txn.transaction_timestamp)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Showing {filteredTransactions.length} of {transactions.length} records</span>
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
            <form onSubmit={handleDeposit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label>Destination Account *</label>
                    <select 
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      required
                    >
                      {accounts.map(acc => (
                        <option key={acc.account_id} value={acc.account_id}>
                          {acc.account_number} — {acc.customer_name || 'Holder'} (Balance: {formatCurrency(acc.current_balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label>Processing Agent *</label>
                    <select 
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      required
                    >
                      {agents.map(a => (
                        <option key={a.agent_id} value={a.agent_id}>
                          Agent #{a.agent_id} — {a.agent_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label>Deposit Amount (LKR) *</label>
                    <div className="amount-input-wrapper">
                      <span className="currency">Rs.</span>
                      <input 
                        type="number" 
                        step="0.01"
                        min="1"
                        placeholder="0.00" 
                        className="amount-input" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-span-2">
                    <label>Reference Number *</label>
                    <input 
                      type="text" 
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsDepositModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Processing...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
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
            <form onSubmit={handleWithdraw}>
              <div className="modal-body">
                <div className="alert-box warning mb-4" style={{ padding: '0.75rem', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '6px' }}>
                  <strong>Important:</strong> Stored trigger validates minimum balance. Overdrafts will be rejected.
                </div>
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label>Source Account *</label>
                    <select 
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      required
                    >
                      {accounts.map(acc => (
                        <option key={acc.account_id} value={acc.account_id}>
                          {acc.account_number} — {acc.customer_name || 'Holder'} (Balance: {formatCurrency(acc.current_balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label>Processing Agent *</label>
                    <select 
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      required
                    >
                      {agents.map(a => (
                        <option key={a.agent_id} value={a.agent_id}>
                          Agent #{a.agent_id} — {a.agent_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label>Withdrawal Amount (LKR) *</label>
                    <div className="amount-input-wrapper">
                      <span className="currency">Rs.</span>
                      <input 
                        type="number" 
                        step="0.01"
                        min="1"
                        placeholder="0.00" 
                        className="amount-input text-purple-600" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-span-2">
                    <label>Reference Number *</label>
                    <input 
                      type="text" 
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsWithdrawModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{backgroundColor: '#DC2626'}} disabled={submitting}>
                  {submitting ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

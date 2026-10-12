import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Filter, Search, Check, X, Layers, ArrowDownCircle, ArrowUpCircle, Percent } from 'lucide-react';
import './Transactions.css';
import { getTransactions, depositMoney, withdrawMoney, getAccounts, getAgents } from '../api';

const TABS = [
  { id: 'All', label: 'All', icon: Layers },
  { id: 'Deposits', label: 'Deposits', icon: ArrowUpCircle },
  { id: 'Withdrawals', label: 'Withdrawals', icon: ArrowDownCircle },
  { id: 'Interest', label: 'Interest', icon: Percent },
];

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
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
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
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  };

  const openDeposit = () => {
    setSelectedAccountId('');
    setSelectedAgentId('');
    setAccountSearchQuery('');
    setIsAccountDropdownOpen(false);
    setAmount('');
    setRefNo(`DEP-${Date.now().toString().slice(-6)}`);
    setIsDepositModalOpen(true);
  };

  const openWithdrawal = () => {
    setSelectedAccountId('');
    setSelectedAgentId('');
    setAccountSearchQuery('');
    setIsAccountDropdownOpen(false);
    setAmount('');
    setRefNo(`WTH-${Date.now().toString().slice(-6)}`);
    setIsWithdrawModalOpen(true);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!selectedAccountId || !selectedAgentId || !amount || !refNo) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      await depositMoney({
        account_id: parseInt(selectedAccountId),
        agent_id: parseInt(selectedAgentId),
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
    if (!selectedAccountId || !selectedAgentId || !amount || !refNo) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      await withdrawMoney({
        account_id: parseInt(selectedAccountId),
        agent_id: parseInt(selectedAgentId),
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

  // Filter accounts for modal selection
  const filteredModalAccounts = accounts.filter(acc => {
    if (!accountSearchQuery.trim()) return true;
    const q = accountSearchQuery.toLowerCase().trim();
    const accNo = (acc.account_number || '').toLowerCase();
    const holder = (acc.customer_name || acc.primary_customer || '').toLowerCase();
    const id = String(acc.account_id);
    return accNo.includes(q) || holder.includes(q) || id.includes(q);
  });

  const selectedAccount = accounts.find(a => String(a.account_id) === String(selectedAccountId));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Transactions</h2>
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
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
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
                    <div className="account-search-wrapper">
                      {!selectedAccount ? (
                        <>
                          <div className="account-search-bar">
                            <Search size={16} className="search-icon-modal" />
                            <input
                              type="text"
                              placeholder="Search account number, customer name, or ID..."
                              value={accountSearchQuery}
                              onFocus={() => setIsAccountDropdownOpen(true)}
                              onChange={(e) => {
                                setAccountSearchQuery(e.target.value);
                                setIsAccountDropdownOpen(true);
                              }}
                            />
                            {accountSearchQuery && (
                              <button
                                type="button"
                                className="clear-search-btn-modal"
                                onClick={() => {
                                  setAccountSearchQuery('');
                                  setIsAccountDropdownOpen(true);
                                }}
                                title="Clear search"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          {isAccountDropdownOpen && (
                            <div className="account-search-results-popover">
                              <div className="account-search-popover-header">
                                <span>
                                  {accountSearchQuery
                                    ? `Matching Accounts (${filteredModalAccounts.length})`
                                    : `All Accounts (${filteredModalAccounts.length})`}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)' }}>Click to select</span>
                              </div>
                              <div className="account-search-results-list">
                                {filteredModalAccounts.length > 0 ? (
                                  filteredModalAccounts.map(acc => {
                                    const isSelected = String(selectedAccountId) === String(acc.account_id);
                                    return (
                                      <div
                                        key={acc.account_id}
                                        className={`account-search-result-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => {
                                          setSelectedAccountId(String(acc.account_id));
                                          setIsAccountDropdownOpen(false);
                                        }}
                                      >
                                        <div className="account-search-item-main">
                                          <div className="account-search-item-title">
                                            <span className="account-search-item-acc">{acc.account_number}</span>
                                            <span className="account-search-item-name">{acc.customer_name || 'Holder'}</span>
                                          </div>
                                          <div className="account-search-item-sub">
                                            <span>Balance: <strong>{formatCurrency(acc.current_balance)}</strong></span>
                                            {acc.plan_name && <span>• Plan: {acc.plan_name}</span>}
                                          </div>
                                        </div>
                                        {isSelected && <Check size={16} className="text-primary" />}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="account-search-empty">
                                    No accounts match "{accountSearchQuery}".
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="selected-account-card">
                          <div className="selected-account-details">
                            <span className="selected-account-badge">Destination Account</span>
                            <div className="selected-account-name">
                              <strong>{selectedAccount.account_number}</strong> — {selectedAccount.customer_name || 'Holder'}
                            </div>
                            <div className="selected-account-sub">
                              Balance: {formatCurrency(selectedAccount.current_balance)} {selectedAccount.plan_name ? `| Plan: ${selectedAccount.plan_name}` : ''}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-change-account"
                            onClick={() => {
                              setSelectedAccountId('');
                              setIsAccountDropdownOpen(true);
                            }}
                          >
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group col-span-2">
                    <label>Processing Agent *</label>
                    <select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      required
                    >
                      <option value="" disabled>-- Select an agent --</option>
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

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label>Source Account *</label>
                    <div className="account-search-wrapper">
                      {!selectedAccount ? (
                        <>
                          <div className="account-search-bar">
                            <Search size={16} className="search-icon-modal" />
                            <input
                              type="text"
                              placeholder="Search account number, customer name, or ID..."
                              value={accountSearchQuery}
                              onFocus={() => setIsAccountDropdownOpen(true)}
                              onChange={(e) => {
                                setAccountSearchQuery(e.target.value);
                                setIsAccountDropdownOpen(true);
                              }}
                            />
                            {accountSearchQuery && (
                              <button
                                type="button"
                                className="clear-search-btn-modal"
                                onClick={() => {
                                  setAccountSearchQuery('');
                                  setIsAccountDropdownOpen(true);
                                }}
                                title="Clear search"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          {isAccountDropdownOpen && (
                            <div className="account-search-results-popover">
                              <div className="account-search-popover-header">
                                <span>
                                  {accountSearchQuery
                                    ? `Matching Accounts (${filteredModalAccounts.length})`
                                    : `All Accounts (${filteredModalAccounts.length})`}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)' }}>Click to select</span>
                              </div>
                              <div className="account-search-results-list">
                                {filteredModalAccounts.length > 0 ? (
                                  filteredModalAccounts.map(acc => {
                                    const isSelected = String(selectedAccountId) === String(acc.account_id);
                                    return (
                                      <div
                                        key={acc.account_id}
                                        className={`account-search-result-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => {
                                          setSelectedAccountId(String(acc.account_id));
                                          setIsAccountDropdownOpen(false);
                                        }}
                                      >
                                        <div className="account-search-item-main">
                                          <div className="account-search-item-title">
                                            <span className="account-search-item-acc">{acc.account_number}</span>
                                            <span className="account-search-item-name">{acc.customer_name || 'Holder'}</span>
                                          </div>
                                          <div className="account-search-item-sub">
                                            <span>Balance: <strong>{formatCurrency(acc.current_balance)}</strong></span>
                                            {acc.plan_name && <span>• Plan: {acc.plan_name}</span>}
                                          </div>
                                        </div>
                                        {isSelected && <Check size={16} className="text-primary" />}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="account-search-empty">
                                    No accounts match "{accountSearchQuery}".
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="selected-account-card">
                          <div className="selected-account-details">
                            <span className="selected-account-badge" style={{ color: '#7C3AED' }}>Source Account</span>
                            <div className="selected-account-name">
                              <strong>{selectedAccount.account_number}</strong> — {selectedAccount.customer_name || 'Holder'}
                            </div>
                            <div className="selected-account-sub">
                              Balance: {formatCurrency(selectedAccount.current_balance)} {selectedAccount.plan_name ? `| Plan: ${selectedAccount.plan_name}` : ''}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-change-account"
                            onClick={() => {
                              setSelectedAccountId('');
                              setIsAccountDropdownOpen(true);
                            }}
                          >
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group col-span-2">
                    <label>Processing Agent *</label>
                    <select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      required
                    >
                      <option value="" disabled>-- Select an agent --</option>
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
                        className="amount-input text-back-600"
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
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#DC2626' }} disabled={submitting}>
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

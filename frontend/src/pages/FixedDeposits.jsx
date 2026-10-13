import React, { useState, useEffect, useRef } from 'react';
import { Plus, Clock, Percent, ShieldCheck, RefreshCw, Search, X, RotateCcw, Check, ChevronDown, Lock } from 'lucide-react';
import './FixedDeposits.css';
import { getFDPlans, getFixedDeposits, getAccounts, getAgents, createFixedDeposit, closeFixedDeposit } from '../api';

const ICONS = [Clock, Percent, ShieldCheck];
const COLORS = ['blue', 'purple', 'green'];

const FixedDeposits = () => {
  const [fdPlans, setFdPlans] = useState([]);
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tenureFilter, setTenureFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Close FD Modal state
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closingFD, setClosingFD] = useState(null);
  const [fdCloseSearchQuery, setFdCloseSearchQuery] = useState('');
  const [isFdCloseDropdownOpen, setIsFdCloseDropdownOpen] = useState(false);
  const [closingAgentId, setClosingAgentId] = useState('');
  const [closingReason, setClosingReason] = useState('');
  const [closeSubmitting, setCloseSubmitting] = useState(false);

  // Form states
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');

  const accountDropdownRef = useRef(null);
  const fdCloseDropdownRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
        setIsAccountDropdownOpen(false);
      }
      if (fdCloseDropdownRef.current && !fdCloseDropdownRef.current.contains(e.target)) {
        setIsFdCloseDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [plansRes, fdsRes, accountsRes, agentsRes] = await Promise.all([
        getFDPlans(),
        getFixedDeposits(),
        getAccounts(),
        getAgents()
      ]);
      setFdPlans(plansRes.data || []);
      setFixedDeposits(fdsRes.data || []);
      setAccounts(accountsRes.data || []);
      setAgents(agentsRes.data || []);

      if (plansRes.data && plansRes.data.length > 0) {
        setSelectedPlanId(plansRes.data[0].fd_plan_id);
      }
      if (agentsRes.data && agentsRes.data.length > 0) {
        setClosingAgentId(String(agentsRes.data[0].agent_id));
      }
    } catch (err) {
      console.error('Error loading FD data:', err);
      setError('Failed to fetch fixed deposits from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCloseModal = () => {
    setClosingFD(null);
    setFdCloseSearchQuery('');
    setClosingReason('');
    if (agents.length > 0) {
      setClosingAgentId(String(agents[0].agent_id));
    }
    setIsCloseModalOpen(true);
  };

  const handleConfirmCloseFD = async (e) => {
    e.preventDefault();
    if (!closingFD) {
      alert('Please search and select the Fixed Deposit to close.');
      return;
    }
    if (!closingAgentId) {
      alert('Please select an authorizing agent.');
      return;
    }
    if (!closingReason.trim()) {
      alert('Please enter a reason for closing the Fixed Deposit.');
      return;
    }

    try {
      setCloseSubmitting(true);
      await closeFixedDeposit(closingFD.fd_id);
      alert(`Fixed Deposit FD-${String(closingFD.fd_id).padStart(4, '0')} closed successfully.\nPrincipal of ${formatCurrency(closingFD.principal_amount)} returned to linked account #${closingFD.account_id}.\nReason: ${closingReason}`);
      setIsCloseModalOpen(false);
      setClosingFD(null);
      setFdCloseSearchQuery('');
      setClosingReason('');
      loadData();
    } catch (err) {
      console.error('Error closing FD:', err);
      alert(err.response?.data?.detail || 'Failed to close fixed deposit.');
    } finally {
      setCloseSubmitting(false);
    }
  };

  const handleOpenModal = () => {
    setSelectedAccountId('');
    setAccountSearchQuery('');
    setPrincipalAmount('');
    setError(null);
    setFormSuccess(null);
    if (fdPlans.length > 0) {
      setSelectedPlanId(fdPlans[0].fd_plan_id);
    }
    setIsModalOpen(true);
  };

  const handleCreateFD = async (e) => {
    e.preventDefault();
    if (!selectedAccountId) {
      alert('Please select a savings account to link.');
      return;
    }
    if (!selectedPlanId || !principalAmount) {
      alert('Please fill in all required fields.');
      return;
    }

    const principal = parseFloat(principalAmount);
    if (isNaN(principal) || principal <= 0) {
      alert('Please enter a valid principal deposit amount.');
      return;
    }

    try {
      setSubmitting(true);
      await createFixedDeposit({
        account_id: parseInt(selectedAccountId),
        fd_plan_id: parseInt(selectedPlanId),
        principal_amount: principal
      });
      setFormSuccess('Fixed deposit created successfully! Funds transferred from savings account.');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
        setPrincipalAmount('');
        setSelectedAccountId('');
      }, 1200);
      loadData();
    } catch (err) {
      console.error('Error creating FD:', err);
      alert(err.response?.data?.detail || 'Failed to create fixed deposit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseFD = async (fd) => {
    const confirmMsg = `Are you sure you want to close FD-${String(fd.fd_id).padStart(4, '0')}? Principal of ${formatCurrency(fd.principal_amount)} will be deposited back to linked savings account (#${fd.account_id}).`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setLoading(true);
      await closeFixedDeposit(fd.fd_id);
      alert(`Fixed Deposit FD-${String(fd.fd_id).padStart(4, '0')} closed successfully. Principal returned to account #${fd.account_id}.`);
      loadData();
    } catch (err) {
      console.error('Error closing FD:', err);
      alert(err.response?.data?.detail || 'Failed to close fixed deposit.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return 'Rs. ' + Number(val || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleClearFilters = () => {
    setSearch('');
    setTenureFilter('All');
    setStatusFilter('All');
  };

  const hasActiveFilters = Boolean(search.trim() || tenureFilter !== 'All' || statusFilter !== 'All');

  // Filter FD table matching search, tenure, status
  const filteredFDs = fixedDeposits.filter(fd => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const fdId = `fd-${String(fd.fd_id).padStart(4, '0')}`.toLowerCase();
      const accId = `account #${fd.account_id}`.toLowerCase();
      const accNo = (fd.account_number || '').toLowerCase();
      const holderName = (fd.customer_name || '').toLowerCase();
      if (!fdId.includes(q) && !accId.includes(q) && !accNo.includes(q) && !holderName.includes(q)) {
        return false;
      }
    }

    if (tenureFilter !== 'All') {
      if (String(fd.term_months) !== String(tenureFilter)) {
        return false;
      }
    }

    if (statusFilter !== 'All' && fd.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Filter accounts for modal linking
  const filteredModalAccounts = accounts.filter(acc => {
    if (!accountSearchQuery.trim()) return true;
    const q = accountSearchQuery.toLowerCase().trim();
    const accNo = (acc.account_number || '').toLowerCase();
    const holder = (acc.customer_name || acc.primary_customer || '').toLowerCase();
    const id = String(acc.account_id);
    return accNo.includes(q) || holder.includes(q) || id.includes(q);
  });

  // Filter active FDs available to be closed
  const filteredFDsToClose = fixedDeposits.filter(fd => {
    if (fd.status === 'Closed') return false;
    if (!fdCloseSearchQuery.trim()) return true;
    const q = fdCloseSearchQuery.toLowerCase().trim();
    const fdId = `fd-${String(fd.fd_id).padStart(4, '0')}`.toLowerCase();
    const accId = `account #${fd.account_id}`.toLowerCase();
    const accNo = (fd.account_number || '').toLowerCase();
    const holder = (fd.customer_name || '').toLowerCase();
    return fdId.includes(q) || accId.includes(q) || accNo.includes(q) || holder.includes(q);
  });

  const selectedAccount = accounts.find(a => String(a.account_id) === String(selectedAccountId));
  const selectedPlan = fdPlans.find(p => p.fd_plan_id === Number(selectedPlanId));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Fixed Deposits</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-outline"
            style={{
              borderColor: '#f87171',
              color: '#dc2626',
              backgroundColor: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={handleOpenCloseModal}
          >
            <X size={18} /> Close Fixed Deposit
          </button>
          <button className="btn-primary" onClick={handleOpenModal}>
            <Plus size={18} /> Open Fixed Deposit
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {/* Available Plans matching Accounts page design */}
      <h3 className="section-title">Available Fixed Deposit Plans</h3>
      <div className="plans-grid">
        {loading ? (
          <div style={{ padding: '0.75rem', color: '#7F8C8D' }}>Loading FD plans from database...</div>
        ) : (
          fdPlans.map((plan, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            const color = COLORS[idx % COLORS.length];
            const termLabel = plan.term_months >= 12
              ? `${plan.term_months / 12} Year${plan.term_months > 12 ? 's' : ''}`
              : `${plan.term_months} Months`;
            return (
              <div key={plan.fd_plan_id} className="plan-card">
                <div className="plan-card-top">
                  <div className={`plan-icon-sm bg-${color}-100 text-${color}-600`}>
                    <Icon size={20} />
                  </div>
                  <div className="plan-header-info">
                    <h4>{termLabel} Tenure</h4>
                    <span className="plan-rate">{plan.interest_rate}% p.a.</span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Table section matching Accounts page */}
      <h3 className="section-title mt-6">
        Active Fixed Deposits ({filteredFDs.length}{hasActiveFilters ? ` of ${fixedDeposits.length}` : ''})
      </h3>
      <div className="card table-card">
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="search-bar">
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search by FD ID, account, or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearch('')}
                  title="Clear search text"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="filter-group">
              <select
                className="filter-select"
                value={tenureFilter}
                onChange={(e) => setTenureFilter(e.target.value)}
                aria-label="Filter by Tenure"
              >
                <option value="All">All Tenures</option>
                {fdPlans.map(p => (
                  <option key={p.fd_plan_id} value={p.term_months}>
                    {p.term_months} Months ({p.interest_rate}%)
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Matured">Matured</option>
                <option value="Closed">Closed</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn-reset-filters"
                  onClick={handleClearFilters}
                  title="Reset all filters"
                >
                  <RotateCcw size={14} /> Reset
                </button>
              )}
            </div>
          </div>

          <button className="btn-outline" onClick={loadData}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>FD ID</th>
                <th>Linked Account</th>
                <th>Principal Amount</th>
                <th>Tenure</th>
                <th>Interest Rate</th>
                <th>Start Date</th>
                <th>Maturity Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    Loading fixed deposits from database...
                  </td>
                </tr>
              ) : filteredFDs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#7F8C8D' }}>
                    {hasActiveFilters ? (
                      <div>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                          No fixed deposits found matching your search and filter criteria.
                        </p>
                        <button
                          className="btn-outline"
                          style={{ marginTop: '0.75rem', display: 'inline-flex', padding: '6px 14px' }}
                          onClick={handleClearFilters}
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      'No fixed deposits found.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredFDs.map(fd => (
                  <tr key={fd.fd_id}>
                    <td className="font-medium text-yellow-600">FD-{String(fd.fd_id).padStart(4, '0')}</td>
                    <td>{fd.account_number ? `${fd.account_number} (#${fd.account_id})` : `Account #${fd.account_id}`}</td>
                    <td className="font-medium">{formatCurrency(fd.principal_amount)}</td>
                    <td><span className="badge badge-outline">{fd.term_months} Months</span></td>
                    <td>{fd.interest_rate}% p.a.</td>
                    <td>{fd.start_date}</td>
                    <td>{fd.maturity_date}</td>
                    <td>
                      <span className={`badge ${fd.status === 'Active' ? 'badge-success' : fd.status === 'Closed' ? 'badge-error' : 'badge-warning'}`}>
                        {fd.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal matching Accounts page design */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-large">
            <div className="modal-header">
              <h3>Create Fixed Deposit</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            {formSuccess && (
              <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.75rem', margin: '1rem', borderRadius: '6px' }}>
                {formSuccess}
              </div>
            )}
            <form onSubmit={handleCreateFD}>
              <div className="modal-body">
                <div className="form-grid">
                  {/* Linked Savings Account Search */}
                  <div className="form-group col-span-2">
                    <label>Link to Savings Account *</label>
                    <div className="fd-search-wrapper" ref={accountDropdownRef}>
                      <div className="fd-search-bar">
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
                            className="clear-search-btn"
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

                      {/* Dropdown list showing matching accounts */}
                      {isAccountDropdownOpen && (
                        <div className="fd-search-results-popover">
                          <div className="fd-search-popover-header">
                            <span>
                              {accountSearchQuery
                                ? `Matching Accounts (${filteredModalAccounts.length})`
                                : `All Eligible Accounts (${filteredModalAccounts.length})`}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)' }}>Click to select</span>
                          </div>
                          <div className="fd-search-results-list">
                            {filteredModalAccounts.length > 0 ? (
                              filteredModalAccounts.map(acc => {
                                const isSelected = String(selectedAccountId) === String(acc.account_id);
                                return (
                                  <div
                                    key={acc.account_id}
                                    className={`fd-search-result-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                      setSelectedAccountId(String(acc.account_id));
                                      setIsAccountDropdownOpen(false);
                                    }}
                                  >
                                    <div className="fd-item-main">
                                      <div className="fd-item-title">
                                        <span className="fd-item-acc">{acc.account_number}</span>
                                        <span className="fd-item-name">{acc.customer_name || acc.primary_customer || 'Account Holder'}</span>
                                      </div>
                                      <div className="fd-item-sub">
                                        <span>Balance: <strong>{formatCurrency(acc.current_balance)}</strong></span>
                                        <span>• Plan: {acc.plan_name || 'Savings'}</span>
                                      </div>
                                    </div>
                                    {isSelected && <Check size={16} className="text-primary" />}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="fd-search-empty">
                                No savings accounts match "{accountSearchQuery}".
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Selected Account Card */}
                      {selectedAccount && (
                        <div className="selected-fd-card">
                          <div className="selected-fd-details">
                            <span className="selected-fd-badge">Selected Account</span>
                            <div className="selected-fd-name">
                              <strong>{selectedAccount.account_number}</strong> — {selectedAccount.customer_name || selectedAccount.primary_customer || 'Holder'}
                            </div>
                            <div className="selected-fd-sub">
                              Available Balance: {formatCurrency(selectedAccount.current_balance)} | Plan: {selectedAccount.plan_name}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-change-fd"
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

                  {/* FD Plan Selector matching Accounts Page */}
                  <div className="form-group col-span-2">
                    <label>Select FD Plan / Tenure *</label>
                    <div className="plan-selector">
                      {fdPlans.map(plan => {
                        const termLabel = plan.term_months >= 12
                          ? `${plan.term_months / 12} Year${plan.term_months > 12 ? 's' : ''}`
                          : `${plan.term_months} Months`;
                        const isSelected = Number(selectedPlanId) === plan.fd_plan_id;
                        return (
                          <div
                            key={plan.fd_plan_id}
                            className={`plan-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedPlanId(plan.fd_plan_id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <strong>{termLabel}</strong>
                            <span>{plan.interest_rate}% p.a.</span>
                            <span className="plan-option-sub">{plan.term_months} Months Tenure</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Principal Deposit Amount */}
                  <div className="form-group col-span-2">
                    <label>Principal Deposit Amount (LKR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="e.g. 50000"
                      value={principalAmount}
                      onChange={(e) => setPrincipalAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Fixed Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Fixed Deposit Modal */}
      {isCloseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-large">
            <div className="modal-header">
              <h3 style={{ color: '#dc2626' }}>Close Fixed Deposit</h3>
              <button className="close-btn" onClick={() => setIsCloseModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleConfirmCloseFD}>
              <div className="modal-body">
                <div className="form-grid">
                  {/* FD Search & Select */}
                  <div className="form-group col-span-2">
                    <label>Search & Select Fixed Deposit to Close *</label>
                    <div className="customer-search-wrapper" ref={fdCloseDropdownRef}>
                      <div className="customer-search-bar">
                        <div className="customer-search-input-wrap">
                          <Search size={16} className="search-icon-modal" />
                          <input
                            type="text"
                            placeholder="Search by FD ID (e.g. FD-0001), account no, or customer name..."
                            value={fdCloseSearchQuery}
                            onFocus={() => setIsFdCloseDropdownOpen(true)}
                            onChange={(e) => {
                              setFdCloseSearchQuery(e.target.value);
                              setIsFdCloseDropdownOpen(true);
                            }}
                          />
                          {fdCloseSearchQuery && (
                            <button
                              type="button"
                              className="clear-search-btn"
                              onClick={() => {
                                setFdCloseSearchQuery('');
                                setIsFdCloseDropdownOpen(true);
                              }}
                              title="Clear search"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dropdown list of FDs */}
                      {isFdCloseDropdownOpen && (
                        <div className="customer-search-results-popover">
                          <div className="customer-search-popover-header">
                            <span>Available FDs to Close ({filteredFDsToClose.length})</span>
                            <span className="search-popover-hint">Click FD to select</span>
                          </div>
                          <div className="customer-search-results-list">
                            {filteredFDsToClose.length > 0 ? (
                              filteredFDsToClose.map(fd => {
                                const isSelected = closingFD && closingFD.fd_id === fd.fd_id;
                                return (
                                  <div
                                    key={fd.fd_id}
                                    className={`customer-search-result-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                      setClosingFD(fd);
                                      setIsFdCloseDropdownOpen(false);
                                    }}
                                  >
                                    <div className="cust-item-main">
                                      <div className="cust-item-title">
                                        <span className="cust-item-id">FD-{String(fd.fd_id).padStart(4, '0')}</span>
                                        <span className="cust-item-name">{fd.account_number ? `${fd.account_number} (#${fd.account_id})` : `Account #${fd.account_id}`}</span>
                                      </div>
                                      <div className="cust-item-sub">
                                        <span>Principal: <strong>{formatCurrency(fd.principal_amount)}</strong></span>
                                        <span>• Tenure: {fd.term_months} Mo ({fd.interest_rate}%)</span>
                                        <span>• Status: {fd.status}</span>
                                      </div>
                                    </div>
                                    {isSelected && <Check size={16} className="text-primary" />}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="customer-search-empty">
                                No active fixed deposits match "{fdCloseSearchQuery}".
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Selected FD Card */}
                      {closingFD && (
                        <div className="selected-customer-card" style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>
                          <div className="selected-customer-details">
                            <span className="selected-cust-badge" style={{ color: '#dc2626' }}>Selected FD for Closure</span>
                            <div className="selected-cust-name">
                              <strong>FD-{String(closingFD.fd_id).padStart(4, '0')}</strong> — Linked to Account #{closingFD.account_id} {closingFD.account_number ? `(${closingFD.account_number})` : ''}
                            </div>
                            <div className="selected-cust-nic">
                              Principal to Refund: <strong>{formatCurrency(closingFD.principal_amount)}</strong> | Tenure: {closingFD.term_months} Months ({closingFD.interest_rate}%) | Maturity: {closingFD.maturity_date}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-change-cust"
                            onClick={() => {
                              setClosingFD(null);
                              setIsFdCloseDropdownOpen(true);
                            }}
                          >
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agent Selection */}
                  <div className="form-group col-span-2">
                    <label>Select Authorizing Agent *</label>
                    <select
                      value={closingAgentId}
                      onChange={(e) => setClosingAgentId(e.target.value)}
                      required
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        backgroundColor: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">-- Choose Agent --</option>
                      {agents.map(ag => (
                        <option key={ag.agent_id} value={ag.agent_id}>
                          {ag.agent_name} {ag.branch_name ? `(${ag.branch_name})` : `(Agent #${ag.agent_id})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reason for Closure */}
                  <div className="form-group col-span-2">
                    <label>Reason for Closing *</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Early premature withdrawal, maturity payout, emergency fund requirement..."
                      value={closingReason}
                      onChange={(e) => setClosingReason(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsCloseModalOpen(false)}>Cancel</button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  disabled={closeSubmitting}
                >
                  {closeSubmitting ? 'Closing FD...' : 'Confirm FD Closure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedDeposits;


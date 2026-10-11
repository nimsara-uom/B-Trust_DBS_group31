import React, { useState, useEffect, useRef } from 'react';
import { Plus, Clock, Percent, ShieldCheck, RefreshCw, Search, X, RotateCcw, Check, ChevronDown, Lock } from 'lucide-react';
import './FixedDeposits.css';
import { getFDPlans, getFixedDeposits, getAccounts, createFixedDeposit } from '../api';

const ICONS = [Clock, Percent, ShieldCheck];
const COLORS = ['blue', 'purple', 'green'];

const FixedDeposits = () => {
  const [fdPlans, setFdPlans] = useState([]);
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tenureFilter, setTenureFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Form states
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');

  const accountDropdownRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
        setIsAccountDropdownOpen(false);
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
      const [plansRes, fdsRes, accountsRes] = await Promise.all([
        getFDPlans(),
        getFixedDeposits(),
        getAccounts()
      ]);
      setFdPlans(plansRes.data || []);
      setFixedDeposits(fdsRes.data || []);
      setAccounts(accountsRes.data || []);

      if (plansRes.data && plansRes.data.length > 0) {
        setSelectedPlanId(plansRes.data[0].fd_plan_id);
      }
    } catch (err) {
      console.error('Error loading FD data:', err);
      setError('Failed to fetch fixed deposits from database.');
    } finally {
      setLoading(false);
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

  const selectedAccount = accounts.find(a => String(a.account_id) === String(selectedAccountId));
  const selectedPlan = fdPlans.find(p => p.fd_plan_id === Number(selectedPlanId));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Fixed Deposits</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                      <span className={`badge ${fd.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
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
    </div>
  );
};

export default FixedDeposits;


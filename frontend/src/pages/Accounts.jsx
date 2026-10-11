import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Plus, ShieldCheck, UserCircle, Users, RefreshCw, Search, X, RotateCcw, Check, ChevronDown } from 'lucide-react';
import './Accounts.css';
import { getPlans, getAccounts, getCustomers, createAccount } from '../api';

const PLAN_ICONS = {
  Children: ShieldCheck,
  Teen: UserCircle,
  Adult: Wallet,
  Senior: ShieldCheck,
  Joint: Users
};

const PLAN_COLORS = {
  Children: 'blue',
  Teen: 'purple',
  Adult: 'green',
  Senior: 'yellow',
  Joint: 'pink'
};

const Accounts = () => {
  const [plans, setPlans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [custSearchQuery, setCustSearchQuery] = useState('');
  const [isCustDropdownOpen, setIsCustDropdownOpen] = useState(false);
  const [initialDeposit, setInitialDeposit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const custDropdownRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (custDropdownRef.current && !custDropdownRef.current.contains(e.target)) {
        setIsCustDropdownOpen(false);
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
      const [plansRes, accountsRes, customersRes] = await Promise.all([
        getPlans(),
        getAccounts(),
        getCustomers()
      ]);
      setPlans(plansRes.data || []);
      setAccounts(accountsRes.data || []);
      setCustomers(customersRes.data || []);
      // Default: no customer selected
      setSelectedCustomerId('');
      // Default: no plan selected
      setSelectedPlanId('');
    } catch (err) {
      console.error('Failed to load accounts data:', err);
      const message = err.response?.data?.detail || err.message || 'Failed to connect to backend server or database.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setSelectedCustomerId('');
    setCustSearchQuery('');
    setSelectedPlanId('');
    setInitialDeposit('');
    setError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlanId(plan.plan_id);
    const minBal = Number(plan.minimum_balance || 0);
    // Automatically fill the minimum balance. If current deposit is less than min balance, update to min balance.
    setInitialDeposit(minBal.toString());
  };

  const handleDepositChange = (e) => {
    const val = e.target.value;
    const selectedPlan = plans.find(p => String(p.plan_id) === String(selectedPlanId));
    const minBal = selectedPlan ? Number(selectedPlan.minimum_balance || 0) : 0;

    if (val === '') {
      setInitialDeposit('');
      return;
    }

    const numVal = parseFloat(val);
    if (!isNaN(numVal)) {
      // It can increase and cannot decrease below minimum balance
      if (selectedPlan && numVal < minBal) {
        setInitialDeposit(minBal.toString());
        return;
      }
    }
    setInitialDeposit(val);
  };

  const handleDepositBlur = () => {
    const selectedPlan = plans.find(p => String(p.plan_id) === String(selectedPlanId));
    if (selectedPlan) {
      const minBal = Number(selectedPlan.minimum_balance || 0);
      const numVal = parseFloat(initialDeposit);
      if (initialDeposit === '' || isNaN(numVal) || numVal < minBal) {
        setInitialDeposit(minBal.toString());
      }
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer.');
      return;
    }
    if (!selectedPlanId) {
      alert('Please select a savings plan.');
      return;
    }
    const selectedPlan = plans.find(p => String(p.plan_id) === String(selectedPlanId));
    const minBal = selectedPlan ? Number(selectedPlan.minimum_balance || 0) : 0;
    const depositAmount = parseFloat(initialDeposit);

    if (initialDeposit === '' || isNaN(depositAmount) || depositAmount < minBal) {
      alert(`Initial deposit cannot be less than the minimum balance requirement of ${formatCurrency(minBal)}.`);
      setInitialDeposit(minBal.toString());
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createAccount({
        customer_id: parseInt(selectedCustomerId),
        plan_id: parseInt(selectedPlanId),
        initial_deposit: depositAmount,
      });

      setFormSuccess('Savings account created successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
        setSelectedCustomerId('');
        setSelectedPlanId('');
        setInitialDeposit('');
      }, 1000);
      const accRes = await getAccounts();
      setAccounts(accRes.data || []);
    } catch (err) {
      console.error('Failed to create account:', err);
      alert(err.response?.data?.detail || 'Failed to create savings account.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return 'Rs. ' + Number(val || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleClearFilters = () => {
    setSearch('');
    setPlanFilter('All');
    setStatusFilter('All');
  };

  const hasActiveFilters = Boolean(search.trim() || planFilter !== 'All' || statusFilter !== 'All');

  // Search by name, account number, or NIC; filter by plan and status
  const filteredAccounts = accounts.filter(acc => {
    // 1. Search options: Name, Account Number, or NIC
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const accNo = (acc.account_number || '').toLowerCase();
      const custName = (acc.customer_name || acc.primary_customer || '').toLowerCase();
      const nic = (acc.national_id || '').toLowerCase();
      if (!accNo.includes(q) && !custName.includes(q) && !nic.includes(q)) {
        return false;
      }
    }

    // 2. Plan filter
    if (planFilter !== 'All' && acc.plan_name !== planFilter) {
      return false;
    }

    // 3. Status filter
    if (statusFilter !== 'All' && acc.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const filteredModalCustomers = customers.filter(c => {
    if (!custSearchQuery.trim()) return true;
    const q = custSearchQuery.toLowerCase().trim();
    const nameMatch = (c.full_name || '').toLowerCase().includes(q);
    const idFormatted = `cust-${String(c.customer_id).padStart(3, '0')}`.toLowerCase();
    const idRaw = String(c.customer_id);
    const idMatch = idFormatted.includes(q) || idRaw.includes(q);
    const nicMatch = (c.national_id || '').toLowerCase().includes(q);

    return nameMatch || idMatch || nicMatch;
  });

  const selectedCustomer = customers.find(c => String(c.customer_id) === String(selectedCustomerId));
  const selectedPlan = plans.find(p => String(p.plan_id) === String(selectedPlanId));
  const minRequiredBalance = selectedPlan ? Number(selectedPlan.minimum_balance || 0) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Savings Accounts</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={handleOpenModal}>
            <Plus size={18} /> Open Savings Account
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <h3 className="section-title">Available Savings Plans</h3>
      <div className="plans-grid">
        {loading ? (
          <div style={{ padding: '0.75rem', color: '#7F8C8D' }}>Loading plans from database...</div>
        ) : (
          plans.map(plan => {
            const Icon = PLAN_ICONS[plan.plan_name] || Wallet;
            const color = PLAN_COLORS[plan.plan_name] || 'blue';
            return (
              <div
                key={plan.plan_id}
                className="plan-card"
              >
                <div className="plan-card-top">
                  <div className={`plan-icon-sm bg-${color}-100 text-${color}-600`}>
                    <Icon size={18} />
                  </div>
                  <div className="plan-header-info">
                    <h4>{plan.plan_name}</h4>
                    <span className="plan-rate">{plan.interest_rate}% p.a.</span>
                  </div>
                </div>

                <div className="plan-card-bottom">
                  <div className="plan-min-bal">
                    <span>Min Balance: </span><strong>{formatCurrency(plan.minimum_balance)}</strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <h3 className="section-title mt-6">
        All Savings Accounts ({filteredAccounts.length}{hasActiveFilters ? ` of ${accounts.length}` : ''})
      </h3>
      <div className="card table-card">
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="search-bar">
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search by name, account no, or NIC..."
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
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                aria-label="Filter by Plan"
              >
                <option value="All">All Plans</option>
                {plans.map(p => (
                  <option key={p.plan_id} value={p.plan_name}>
                    {p.plan_name}
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
                <option value="Inactive">Inactive</option>
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
                <th>Account No</th>
                <th>Primary Customer</th>
                <th>Plan</th>
                <th>Interest Rate</th>
                <th>Current Balance</th>
                <th>Status</th>
                <th>Opened Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    Loading accounts...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#7F8C8D' }}>
                    {hasActiveFilters ? (
                      <div>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                          No savings accounts found matching your search and filter criteria.
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
                      'No savings accounts found.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(acc => (
                  <tr key={acc.account_id}>
                    <td className="font-medium text-blue-600">{acc.account_number}</td>
                    <td>{acc.customer_name || acc.primary_customer || 'Account Holder'}</td>
                    <td><span className="badge badge-outline">{acc.plan_name}</span></td>
                    <td>{acc.interest_rate != null ? `${acc.interest_rate}%` : '-'}</td>
                    <td className="font-medium">{formatCurrency(acc.current_balance)}</td>
                    <td>
                      <span className={`badge ${acc.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                        {acc.status}
                      </span>
                    </td>
                    <td>{acc.opened_date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-large">
            <div className="modal-header">
              <h3>Open Savings Account</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            {formSuccess && (
              <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.75rem', margin: '1rem', borderRadius: '6px' }}>
                {formSuccess}
              </div>
            )}
            <form onSubmit={handleCreateAccount}>
              <div className="modal-body">
                <div className="form-grid">
                  {/* Customer search & selection */}
                  <div className="form-group col-span-2">
                    <label>Select Customer *</label>
                    <div className="customer-search-wrapper" ref={custDropdownRef}>
                      <div className="customer-search-bar">
                        <div className="customer-search-input-wrap">
                          <Search size={16} className="search-icon-modal" />
                          <input
                            type="text"
                            placeholder="Search by customer name, NIC, or customer ID..."
                            value={custSearchQuery}
                            onFocus={() => setIsCustDropdownOpen(true)}
                            onChange={(e) => {
                              setCustSearchQuery(e.target.value);
                              setIsCustDropdownOpen(true);
                            }}
                          />
                          {custSearchQuery && (
                            <button
                              type="button"
                              className="clear-search-btn"
                              onClick={() => {
                                setCustSearchQuery('');
                                setIsCustDropdownOpen(true);
                              }}
                              title="Clear search"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dropdown list showing matching customers when typing or focused */}
                      {isCustDropdownOpen && (
                        <div className="customer-search-results-popover">
                          <div className="customer-search-popover-header">
                            <span>
                              {custSearchQuery
                                ? `Matching Customers (${filteredModalCustomers.length})`
                                : `Customers List (${filteredModalCustomers.length})`}
                            </span>
                            <span className="search-popover-hint">Click a customer to select</span>
                          </div>
                          <div className="customer-search-results-list">
                            {filteredModalCustomers.length > 0 ? (
                              filteredModalCustomers.map(c => {
                                const isSelected = String(selectedCustomerId) === String(c.customer_id);
                                return (
                                  <div
                                    key={c.customer_id}
                                    className={`customer-search-result-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                      setSelectedCustomerId(String(c.customer_id));
                                      setIsCustDropdownOpen(false);
                                    }}
                                  >
                                    <div className="cust-item-main">
                                      <div className="cust-item-title">
                                        <span className="cust-item-id">CUST-{String(c.customer_id).padStart(3, '0')}</span>
                                        <span className="cust-item-name">{c.full_name}</span>
                                      </div>
                                      <div className="cust-item-sub">
                                        <span>NIC: <strong>{c.national_id || 'N/A'}</strong></span>
                                        {c.phone && <span>• Tel: {c.phone}</span>}
                                        {c.customer_type && (
                                          <span className="cust-item-type-tag">{c.customer_type}</span>
                                        )}
                                      </div>
                                    </div>
                                    {isSelected && <Check size={16} className="text-primary" />}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="customer-search-empty">
                                No customers match "{custSearchQuery}". Try another search term or filter.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Selected Customer Card */}
                      {selectedCustomer && (
                        <div className="selected-customer-card">
                          <div className="selected-customer-details">
                            <span className="selected-cust-badge">Selected Customer</span>
                            <div className="selected-cust-name">
                              <strong>CUST-{String(selectedCustomer.customer_id).padStart(3, '0')}</strong> — {selectedCustomer.full_name}
                            </div>
                            <div className="selected-cust-nic">NIC: {selectedCustomer.national_id} | Phone: {selectedCustomer.phone || '-'}</div>
                          </div>
                          <button
                            type="button"
                            className="btn-change-cust"
                            onClick={() => {
                              setSelectedCustomerId('');
                              setIsCustDropdownOpen(true);
                            }}
                          >
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Savings Plan Selection */}
                  <div className="form-group col-span-2">
                    <label>Select Savings Plan *</label>
                    <div className="plan-selector">
                      {plans.map(plan => (
                        <div
                          key={plan.plan_id}
                          className={`plan-option ${Number(selectedPlanId) === plan.plan_id ? 'selected' : ''}`}
                          onClick={() => handlePlanSelect(plan)}
                          style={{ cursor: 'pointer' }}
                        >
                          <strong>{plan.plan_name}</strong>
                          <span>{plan.interest_rate}%</span>
                          <span className="plan-option-min">Min: {formatCurrency(plan.minimum_balance)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Initial Deposit Amount */}
                  <div className="form-group col-span-2">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ margin: 0 }}>Initial Deposit Amount (LKR) *</label>
                      {selectedPlan && (
                        <span className="deposit-min-badge">
                          Min Required: <strong>{formatCurrency(minRequiredBalance)}</strong>
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min={minRequiredBalance}
                      placeholder={selectedPlan ? `Minimum ${minRequiredBalance}` : 'Select a plan first'}
                      value={initialDeposit}
                      onChange={handleDepositChange}
                      onBlur={handleDepositBlur}
                      required
                      style={{ marginTop: '6px' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;

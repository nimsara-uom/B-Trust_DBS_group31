import React, { useState, useEffect } from 'react';
import { FileText, Clock, RefreshCw, Search, X, RotateCcw, TrendingUp, ArrowUpRight, Zap } from 'lucide-react';
import './InterestManagement.css';
import { getMonthlyInterestDistribution, getActiveFDsReport } from '../api';

const InterestManagement = () => {
  const [distributions, setDistributions] = useState([]);
  const [activeFDs, setActiveFDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table filters
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');

  useEffect(() => {
    loadEngineData();
  }, []);

  const loadEngineData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [distRes, fdsRes] = await Promise.all([
        getMonthlyInterestDistribution(),
        getActiveFDsReport()
      ]);
      setDistributions(distRes.data || []);
      setActiveFDs(fdsRes.data || []);
    } catch (err) {
      console.error('Failed to load interest data:', err);
      setError('Failed to fetch interest audit records from database.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return 'Rs. ' + Number(val || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalEstMonthlyPayout = activeFDs.reduce((acc, fd) => {
    const p = parseFloat(fd.principal_amount || 0);
    const r = parseFloat(fd.interest_rate || 0) / 100;
    return acc + (p * r / 12);
  }, 0);

  const totalInterestCreditedAllTime = distributions.reduce((acc, item) => {
    return acc + parseFloat(item.total_interest_credited || 0);
  }, 0);

  // Filter options for year and plan
  const availableYears = Array.from(new Set(distributions.map(d => String(d.year)))).sort().reverse();
  const availablePlans = Array.from(new Set(distributions.map(d => d.plan_name).filter(Boolean)));

  const handleClearFilters = () => {
    setSearch('');
    setYearFilter('All');
    setPlanFilter('All');
  };

  const hasActiveFilters = Boolean(search.trim() || yearFilter !== 'All' || planFilter !== 'All');

  const filteredDistributions = distributions.filter(item => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const fdId = `fd-${String(item.fd_id).padStart(4, '0')}`.toLowerCase();
      const accNo = (item.account_number || '').toLowerCase();
      const custName = (item.customer_name || '').toLowerCase();
      const plan = (item.plan_name || '').toLowerCase();
      if (!fdId.includes(q) && !accNo.includes(q) && !custName.includes(q) && !plan.includes(q)) {
        return false;
      }
    }

    if (yearFilter !== 'All' && String(item.year) !== String(yearFilter)) {
      return false;
    }

    if (planFilter !== 'All' && item.plan_name !== planFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="page-container">
      {/* Page Header with automated badge */}
      <div className="page-header">
        <div>
          <h2>Interest Engine</h2>
          <p className="page-header-subtitle">
            Interest is automatically calculated and credited on each account's monthly anniversary date.
          </p>
        </div>
        <div className="header-engine-actions">
          <div className="engine-auto-badge">
            <span className="auto-pulse-dot"></span>
            <span className="auto-badge-text">Automated Engine Active</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {/* Metrics Cards Grid matching Accounts page */}
      <h3 className="section-title">Engine Overview & Metrics</h3>
      <div className="plans-grid">
        <div className="plan-card">
          <div className="plan-card-top">
            <div className="plan-icon-sm bg-blue-100 text-blue-600">
              <FileText size={20} />
            </div>
            <div className="plan-header-info">
              <h4>Active Fixed Deposits</h4>
              <span className="plan-rate">{loading ? '...' : activeFDs.length}</span>
            </div>
          </div>

        </div>

        <div className="plan-card">
          <div className="plan-card-top">
            <div className="plan-icon-sm bg-green-100 text-green-600">
              <TrendingUp size={20} />
            </div>
            <div className="plan-header-info">
              <h4>Est. Monthly Payout</h4>
              <span className="plan-rate text-green-600 font-bold" style={{ fontSize: '1.05rem' }}>
                {loading ? '...' : formatCurrency(totalEstMonthlyPayout)}
              </span>
            </div>
          </div>

        </div>

        <div className="plan-card">
          <div className="plan-card-top">
            <div className="plan-icon-sm bg-purple-100 text-purple-600">
              <Clock size={20} />
            </div>
            <div className="plan-header-info">
              <h4>Total Audit Postings</h4>
              <span className="plan-rate">{loading ? '...' : distributions.length}</span>
            </div>
          </div>

        </div>

        <div className="plan-card">
          <div className="plan-card-top">
            <div className="plan-icon-sm bg-yellow-100 text-yellow-600">
              <ArrowUpRight size={20} />
            </div>
            <div className="plan-header-info">
              <h4>Total Interest Paid</h4>
              <span className="plan-rate" style={{ fontSize: '1.05rem', color: '#D97706' }}>
                {loading ? '...' : formatCurrency(totalInterestCreditedAllTime)}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Audit History Table Section */}
      <h3 className="section-title mt-6">
        Interest Distribution History ({filteredDistributions.length}{hasActiveFilters ? ` of ${distributions.length}` : ''})
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
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                aria-label="Filter by Year"
              >
                <option value="All">All Years</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>
                    Year {yr}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                aria-label="Filter by Plan"
              >
                <option value="All">All Plans</option>
                {availablePlans.map(pl => (
                  <option key={pl} value={pl}>
                    {pl}
                  </option>
                ))}
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

          <button className="btn-outline" onClick={loadEngineData}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>FD ID</th>
                <th>Account No</th>
                <th>Customer Name</th>
                <th>FD Plan</th>
                <th>Credits Count</th>
                <th>Interest Credited</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    Loading audit records...
                  </td>
                </tr>
              ) : filteredDistributions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#7F8C8D' }}>
                    {hasActiveFilters ? (
                      <div>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                          No interest distribution records found matching your search and filter criteria.
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
                      'No interest distribution history found in database.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredDistributions.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-medium text-blue-600">
                      {item.year} - {String(item.month).padStart(2, '0')}
                    </td>
                    <td className="font-medium text-yellow-600">
                      FD-{String(item.fd_id).padStart(4, '0')}
                    </td>
                    <td>{item.account_number}</td>
                    <td>{item.customer_name}</td>
                    <td><span className="badge badge-outline">{item.plan_name}</span></td>
                    <td>{item.number_of_interest_credits}</td>
                    <td className="text-green-600 font-medium">
                      + {formatCurrency(item.total_interest_credited)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InterestManagement;


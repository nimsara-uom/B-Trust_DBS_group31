import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getCustomerPortalData, transferCustomerFunds, changeCustomerPassword } from '../api';
import './CustomerPortal.css';

const CustomerPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'transactions' | 'fixed-deposits'

  // Fund Transfer Form State
  const [transferForm, setTransferForm] = useState({
    from_account_id: '',
    to_account_number: '',
    amount: '',
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  // Change Password Form State
  const [pwdForm, setPwdForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Resolve customer ID from user object, localStorage or fallback
  const getResolvedCustomerId = () => {
    if (user?.customer_id) return parseInt(user.customer_id);
    const extractId = (val) => {
      if (!val) return null;
      const str = String(val).trim().toLowerCase();
      if (str.startsWith('cust-')) {
        const num = parseInt(str.replace('cust-', ''));
        if (!isNaN(num)) return num;
      }
      if (str.startsWith('cust')) {
        const num = parseInt(str.replace('cust', ''));
        if (!isNaN(num)) return num;
      }
      if (!isNaN(str)) return parseInt(str);
      return null;
    };

    const idFromUser = extractId(user?.username);
    if (idFromUser) return idFromUser;

    try {
      const saved = localStorage.getItem('btrust_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customer_id) return parseInt(parsed.customer_id);
        const idFromSaved = extractId(parsed.username);
        if (idFromSaved) return idFromSaved;
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const customerId = getResolvedCustomerId();
  const [fetchError, setFetchError] = useState('');

  const fetchPortalData = async () => {
    if (!customerId) {
      setLoading(false);
      setFetchError('Customer ID not found. Please sign out and sign in with your Customer ID.');
      return;
    }
    try {
      setLoading(true);
      setFetchError('');
      const res = await getCustomerPortalData(customerId);
      setPortalData(res.data);
      if (res.data.accounts && res.data.accounts.length > 0) {
        setTransferForm((prev) => ({
          ...prev,
          from_account_id: prev.from_account_id || res.data.accounts[0].account_id
        }));
      }
    } catch (err) {
      console.error('Failed to load customer portal data', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to fetch customer data';
      setFetchError(`Error connecting to bank server: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [customerId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');
    setTransferLoading(true);

    try {
      const res = await transferCustomerFunds({
        from_account_id: parseInt(transferForm.from_account_id),
        to_account_number: transferForm.to_account_number.trim(),
        amount: parseFloat(transferForm.amount),
      });

      setTransferSuccess(res.data.message || 'Transfer completed successfully!');
      setTransferForm({
        from_account_id: portalData?.accounts?.[0]?.account_id || '',
        to_account_number: '',
        amount: '',
      });
      // Refresh balances & transactions
      await fetchPortalData();
      setTimeout(() => {
        setTransferSuccess('');
      }, 4000);
    } catch (err) {
      setTransferError(err.response?.data?.detail || 'Failed to process transfer');
    } finally {
      setTransferLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (pwdForm.new_password.length < 4) {
      setPwdError('Password must be at least 4 characters long.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await changeCustomerPassword({
        customer_id: customerId,
        current_password: pwdForm.current_password,
        new_password: pwdForm.new_password,
      });

      setPwdSuccess(res.data.message || 'Password updated successfully!');

      // Update saved session password in localStorage so future requests continue seamlessly
      try {
        const saved = localStorage.getItem('btrust_auth');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.password = pwdForm.new_password;
          localStorage.setItem('btrust_auth', JSON.stringify(parsed));
        }
      } catch (err) {
        // ignore
      }

      setPwdForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });

      setTimeout(() => {
        setPwdSuccess('');
      }, 4000);
    } catch (err) {
      setPwdError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-portal-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 500 }}>Loading customer portal...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="customer-portal-layout" style={{ alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '500px', width: '100%', background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: '#0f172a', marginBottom: '0.75rem' }}>Unable to Load Customer Portal</h3>
          <p style={{ color: '#ef4444', fontSize: '0.95rem', marginBottom: '1.5rem', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
            {fetchError}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className="btn-primary"
              onClick={fetchPortalData}
            >
              🔄 Retry
            </button>
            <button
              className="portal-sidebar-logout-btn"
              onClick={handleLogout}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profile = portalData?.profile;
  const accounts = portalData?.accounts || [];
  const transactions = portalData?.transactions || [];
  const fixedDeposits = portalData?.fixed_deposits || [];

  const navItems = [
    { key: 'accounts', label: 'My Accounts', icon: '💳︎', count: accounts.length },
    { key: 'transactions', label: 'Transactions History', icon: '⇄', count: transactions.length },
    { key: 'fixed-deposits', label: 'My Fixed Deposits', icon: '🔒︎', count: fixedDeposits.length },
    { key: 'transfer', label: 'Transfer Money', icon: '💸︎' },
    { key: 'password', label: 'Change Password', icon: '🔑︎' },
  ];

  return (
    <div className="customer-portal-layout">
      {/* Left Sidebar Navigator */}
      <nav className="portal-sidebar">
        <div className="portal-sidebar-header">
          <Link to="/portal" style={{ textDecoration: 'none' }}>
            <h2><span style={{ fontSize: '1.2em', marginRight: '8px' }}>🏦︎</span>B-Trust</h2>
            <p>Customer Portal</p>
          </Link>
        </div>

        <ul className="portal-sidebar-nav">
          {navItems.map((item) => (
            <li key={item.key} className={activeTab === item.key ? 'active' : ''}>
              <button className="portal-nav-btn" onClick={() => setActiveTab(item.key)}>
                <span className="nav-btn-content">
                  <span className="nav-btn-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.count !== undefined && (
                  <span className="nav-count-badge">{item.count}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* User Info & Sign Out Footer */}
        <div className="portal-sidebar-footer">
          <div className="portal-sidebar-user">
            <span className="portal-user-icon">👤︎</span>
            <div className="portal-user-meta">
              <span className="portal-meta-name" title={profile?.full_name || user?.name}>
                {profile?.full_name?.split(' ')[0] || user?.name || 'Customer'}
              </span>
              <span className="portal-meta-id">cust-{customerId}</span>
            </div>
          </div>
          <button className="portal-sidebar-logout-btn" onClick={handleLogout} title="Sign Out">
            🚪︎ Exit
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="portal-main-area">
        {/* Welcome Hero Banner */}
        <section className="portal-hero-banner">
          <div className="welcome-info">
            <h1>Welcome back, {profile?.full_name?.split(' ')[0] || 'Valued Customer'}</h1>
            <div className="profile-meta-tags">
              <span>💳︎ NIC: <strong>{profile?.national_id || 'N/A'}</strong></span>
              <span>📞︎ Phone: <strong>{profile?.phone || 'N/A'}</strong></span>
              <span>🏛︎ Branch: <strong>{profile?.branch_name || 'Main Branch'}</strong></span>
            </div>
          </div>
        </section>

        {/* TAB 1: ACCOUNTS */}
        {activeTab === 'accounts' && (
          <div>
            <div className="section-header">
              <h3>Savings Accounts</h3>
            </div>
            {accounts.length === 0 ? (
              <div className="empty-placeholder">No active savings accounts found.</div>
            ) : (
              <div className="accounts-grid">
                {accounts.map((acc) => (
                  <div key={acc.account_id} className="account-card-premium">
                    <div className="acc-card-top">
                      <span className="acc-plan-badge">{acc.plan_name} Plan</span>
                      <span className={`acc-status-badge ${acc.status.toLowerCase()}`}>
                        {acc.status}
                      </span>
                    </div>

                    <div className="acc-number-label">Account Number</div>
                    <div className="acc-number">{acc.account_number}</div>

                    <div className="acc-balance-row">
                      <div>
                        <span className="acc-number-label">Available Balance</span>
                        <div className="balance-amount">
                          LKR {Number(acc.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="rate-info">
                        📈 {acc.interest_rate}% p.a.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div>
            <div className="section-header">
              <h3>All Account Transactions</h3>
            </div>
            <div className="portal-table-card">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Account</th>
                    <th>Reference</th>
                    <th>Transaction Type</th>
                    <th style={{ textAlign: 'right' }}>Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.transaction_id}>
                      <td>{new Date(t.transaction_timestamp).toLocaleString()}</td>
                      <td><code>{t.account_number}</code></td>
                      <td><small style={{ color: '#64748b' }}>{t.reference_no}</small></td>
                      <td>
                        <span className={`badge-${t.transaction_type.toLowerCase()}`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={t.transaction_type === 'Withdrawal' ? 'amount-minus' : 'amount-plus'}>
                          {t.transaction_type === 'Withdrawal' ? '-' : '+'}
                          {Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-placeholder">No transaction records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FIXED DEPOSITS */}
        {activeTab === 'fixed-deposits' && (
          <div>
            <div className="section-header">
              <h3>My Active Fixed Deposits</h3>
            </div>
            {fixedDeposits.length === 0 ? (
              <div className="empty-placeholder">You have no active fixed deposits.</div>
            ) : (
              <div className="portal-table-card">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>FD ID</th>
                      <th>Linked Account</th>
                      <th>Plan Name</th>
                      <th>Term</th>
                      <th>Rate</th>
                      <th>Principal (LKR)</th>
                      <th>Maturity Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fixedDeposits.map((fd) => (
                      <tr key={fd.fd_id}>
                        <td><strong>#{fd.fd_id}</strong></td>
                        <td><code>{fd.account_number}</code></td>
                        <td>{fd.term_months} Month FD</td>
                        <td>{fd.term_months} Months</td>
                        <td><span style={{ color: '#4f46e5', fontWeight: 'bold' }}>{fd.interest_rate}%</span></td>
                        <td><strong>{Number(fd.principal_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                        <td>{fd.maturity_date}</td>
                        <td>
                          <span className={`acc-status-badge ${fd.status.toLowerCase()}`}>
                            {fd.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRANSFER MONEY */}
        {activeTab === 'transfer' && (
          <div>
            <div className="section-header">
              <h3>Transfer Money</h3>
            </div>
            <div style={{ maxWidth: '620px' }}>
              <div className="portal-table-card" style={{ padding: '28px' }}>


                {transferError && <div className="alert-box error">{transferError}</div>}
                {transferSuccess && <div className="alert-box success">{transferSuccess}</div>}

                <form onSubmit={handleTransferSubmit}>
                  <div className="form-field">
                    <label>From My Account</label>
                    <select
                      value={transferForm.from_account_id}
                      onChange={(e) => setTransferForm({ ...transferForm, from_account_id: e.target.value })}
                      required
                    >
                      {accounts.map((acc) => (
                        <option key={acc.account_id} value={acc.account_id}>
                          {acc.account_number} ({acc.plan_name}) — Available: LKR {Number(acc.current_balance).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>To Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. SA-00002"
                      value={transferForm.to_account_number}
                      onChange={(e) => setTransferForm({ ...transferForm, to_account_number: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Amount (LKR)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <button
                      type="submit"
                      className="btn-primary-submit"
                      style={{ padding: '11px 24px', fontSize: '15px' }}
                      disabled={transferLoading}
                    >
                      {transferLoading ? 'Processing Transfer...' : '⇄ Complete Transfer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CHANGE PASSWORD */}
        {activeTab === 'password' && (
          <div>
            <div className="section-header">
              <h3>Change Password</h3>
            </div>
            <div style={{ maxWidth: '540px' }}>
              <div className="portal-table-card" style={{ padding: '28px' }}>


                {pwdError && <div className="alert-box error">{pwdError}</div>}
                {pwdSuccess && <div className="alert-box success">{pwdSuccess}</div>}

                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-field">
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password or NIC if first time"
                      value={pwdForm.current_password}
                      onChange={(e) => setPwdForm({ ...pwdForm, current_password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password (min. 4 characters)"
                      value={pwdForm.new_password}
                      onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={pwdForm.confirm_password}
                      onChange={(e) => setPwdForm({ ...pwdForm, confirm_password: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <button
                      type="submit"
                      className="btn-primary-submit"
                      style={{ padding: '11px 24px', fontSize: '15px' }}
                      disabled={pwdLoading}
                    >
                      {pwdLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerPortal;

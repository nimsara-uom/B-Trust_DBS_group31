import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowRight, ShieldCheck, UserCircle, Users, RefreshCw } from 'lucide-react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  useEffect(() => {
    loadData();
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
      if (plansRes.data && plansRes.data.length > 0) {
        setSelectedPlanId(plansRes.data[0].plan_id);
      }
      if (customersRes.data && customersRes.data.length > 0) {
        setSelectedCustomerId(customersRes.data[0].customer_id);
      }
    } catch (err) {
      console.error('Failed to load accounts data:', err);
      setError('Failed to connect to backend server or database.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedPlanId || initialDeposit === '') {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createAccount({
        customer_id: parseInt(selectedCustomerId),
        plan_id: parseInt(selectedPlanId),
        initial_deposit: parseFloat(initialDeposit),
      });

      setFormSuccess('Savings account created successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Savings Accounts</h2>
          <p>Manage customer savings and plans from database</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" onClick={loadData}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
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
          <div style={{ padding: '1.5rem', color: '#7F8C8D' }}>Loading plans from database...</div>
        ) : (
          plans.map(plan => {
            const Icon = PLAN_ICONS[plan.plan_name] || Wallet;
            const color = PLAN_COLORS[plan.plan_name] || 'blue';
            return (
              <div key={plan.plan_id} className="plan-card">
                <div className={`plan-icon bg-${color}-100 text-${color}-600`}>
                  <Icon size={24} />
                </div>
                <h4>{plan.plan_name} Savings</h4>
                <p>Plan #{plan.plan_id} — Official B-Trust Plan</p>
                
                <div className="plan-details">
                  <div className="detail">
                    <span>Interest Rate</span>
                    <strong>{plan.interest_rate}% p.a.</strong>
                  </div>
                  <div className="detail">
                    <span>Min Balance</span>
                    <strong>{formatCurrency(plan.minimum_balance)}</strong>
                  </div>
                </div>
                
                <button 
                  className="plan-action-btn"
                  onClick={() => {
                    setSelectedPlanId(plan.plan_id);
                    setIsModalOpen(true);
                  }}
                >
                  Select Plan <ArrowRight size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <h3 className="section-title mt-6">All Savings Accounts ({accounts.length})</h3>
      <div className="card table-card">
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
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    No savings accounts found.
                  </td>
                </tr>
              ) : (
                accounts.map(acc => (
                  <tr key={acc.account_id}>
                    <td className="font-medium text-blue-600">{acc.account_number}</td>
                    <td>{acc.customer_name || 'Account Holder'}</td>
                    <td><span className="badge badge-outline">{acc.plan_name}</span></td>
                    <td>{acc.interest_rate ? `${acc.interest_rate}%` : '-'}</td>
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
          <div className="modal-content">
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
                  <div className="form-group col-span-2">
                    <label>Select Customer *</label>
                    <select 
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Customer --</option>
                      {customers.map(c => (
                        <option key={c.customer_id} value={c.customer_id}>
                          CUST-{String(c.customer_id).padStart(3, '0')} — {c.full_name} ({c.national_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group col-span-2">
                    <label>Select Savings Plan *</label>
                    <div className="plan-selector">
                      {plans.map(plan => (
                        <div 
                          key={plan.plan_id} 
                          className={`plan-option ${Number(selectedPlanId) === plan.plan_id ? 'selected' : ''}`}
                          onClick={() => setSelectedPlanId(plan.plan_id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <strong>{plan.plan_name}</strong>
                          <span>{plan.interest_rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group col-span-2">
                    <label>Initial Deposit Amount (LKR) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      placeholder="e.g. 5000" 
                      value={initialDeposit}
                      onChange={(e) => setInitialDeposit(e.target.value)}
                      required
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

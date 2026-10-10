import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, ArrowRight, Clock, Percent, ShieldCheck, RefreshCw } from 'lucide-react';
import './FixedDeposits.css';
import { getFDPlans, getFixedDeposits, getAccounts, createFixedDeposit } from '../api';

const ICONS = [Clock, Percent, ShieldCheck];
const COLORS = ['blue', 'purple', 'green'];

const FixedDeposits = () => {
  const [fdPlans, setFdPlans] = useState([]);
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');

  useEffect(() => {
    loadData();
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
      if (accountsRes.data && accountsRes.data.length > 0) {
        setSelectedAccountId(accountsRes.data[0].account_id);
      }
    } catch (err) {
      console.error('Error loading FD data:', err);
      setError('Failed to fetch fixed deposits from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFD = async (e) => {
    e.preventDefault();
    if (!selectedAccountId || !selectedPlanId || !principalAmount) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      await createFixedDeposit({
        account_id: parseInt(selectedAccountId),
        fd_plan_id: parseInt(selectedPlanId),
        principal_amount: parseFloat(principalAmount)
      });
      setIsModalOpen(false);
      setPrincipalAmount('');
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

  const selectedPlan = fdPlans.find(p => p.fd_plan_id === Number(selectedPlanId));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Fixed Deposits</h2>
          <p>High-yield secure investments for B-Trust customers (live from database)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" onClick={loadData}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Open Fixed Deposit
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="plans-grid">
        {loading ? (
          <div style={{ padding: '1.5rem', color: '#7F8C8D' }}>Loading FD plans...</div>
        ) : (
          fdPlans.map((plan, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            const color = COLORS[idx % COLORS.length];
            return (
              <div key={plan.fd_plan_id} className={`fd-plan-card bg-${color}-gradient`}>
                <div className="fd-plan-icon">
                  <Icon size={32} />
                </div>
                <h4>{plan.term_months >= 12 ? `${plan.term_months / 12} Year${plan.term_months > 12 ? 's' : ''}` : `${plan.term_months} Months`}</h4>
                <div className="fd-rate">
                  <span className="rate-value">{plan.interest_rate}%</span>
                  <span className="rate-label">Interest Rate (p.a.)</span>
                </div>
                <p className="fd-desc">Interest posted monthly to linked savings account</p>
              </div>
            );
          })
        )}
      </div>

      <div className="card table-card mt-6">
        <div className="card-header" style={{padding: '24px 24px 0', marginBottom: '16px'}}>
          <h3>Active Fixed Deposits ({fixedDeposits.length})</h3>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>FD ID</th>
                <th>Linked Account ID</th>
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
              ) : fixedDeposits.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    No fixed deposits found.
                  </td>
                </tr>
              ) : (
                fixedDeposits.map(fd => (
                  <tr key={fd.fd_id}>
                    <td className="font-medium text-yellow-600">FD-{String(fd.fd_id).padStart(4, '0')}</td>
                    <td>Account #{fd.account_id}</td>
                    <td className="font-medium">{formatCurrency(fd.principal_amount)}</td>
                    <td>{fd.term_months} Months</td>
                    <td>{fd.interest_rate}%</td>
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Fixed Deposit</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreateFD}>
              <div className="modal-body">
                <div className="alert-box warning mb-4" style={{ padding: '0.75rem', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '6px' }}>
                  <strong>Business Rule:</strong> Only one fixed deposit can be created per savings account. 
                  Interest will be credited automatically to this linked account every month.
                </div>
                
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label>Link to Savings Account *</label>
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
                  
                  <div className="form-group">
                    <label>FD Plan / Tenure *</label>
                    <select 
                      value={selectedPlanId} 
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      required
                    >
                      {fdPlans.map(plan => (
                        <option key={plan.fd_plan_id} value={plan.fd_plan_id}>
                          {plan.term_months} Months ({plan.interest_rate}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Applicable Rate</label>
                    <input 
                      type="text" 
                      value={selectedPlan ? `${selectedPlan.interest_rate}% p.a.` : ''} 
                      disabled 
                      className="bg-slate-50 font-bold text-green-600" 
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label>Principal Deposit Amount (LKR) *</label>
                    <div className="amount-input-wrapper">
                      <span className="currency">Rs.</span>
                      <input 
                        type="number" 
                        step="0.01"
                        min="1"
                        placeholder="0.00" 
                        className="amount-input text-yellow-600" 
                        value={principalAmount}
                        onChange={(e) => setPrincipalAmount(e.target.value)}
                        required
                      />
                    </div>
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

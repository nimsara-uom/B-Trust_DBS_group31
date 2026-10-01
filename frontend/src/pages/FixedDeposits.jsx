import React, { useState } from 'react';
import { PiggyBank, Plus, ArrowRight, Clock, Percent, ShieldCheck } from 'lucide-react';
import './FixedDeposits.css';

const FD_PLANS = [
  { id: '6m', tenure: '6 Months', rate: '13%', icon: Clock, color: 'blue' },
  { id: '1y', tenure: '1 Year', rate: '14%', icon: Percent, color: 'purple' },
  { id: '3y', tenure: '3 Years', rate: '15%', icon: ShieldCheck, color: 'green' }
];

const MOCK_FDS = [
  { fdNo: 'FD-9982', accNo: 'SV-49321', customer: 'Nimal Perera', principal: 'Rs. 100,000.00', tenure: '1 Year', rate: '14%', openDate: '01 Jan 2026', maturityDate: '01 Jan 2027', status: 'Active' },
  { fdNo: 'FD-9983', accNo: 'SV-78310', customer: 'Kamal Silva', principal: 'Rs. 500,000.00', tenure: '3 Years', rate: '15%', openDate: '15 Feb 2026', maturityDate: '15 Feb 2029', status: 'Active' },
  { fdNo: 'FD-9984', accNo: 'SV-23094', customer: 'Saman Kumara', principal: 'Rs. 250,000.00', tenure: '6 Months', rate: '13%', openDate: '20 Mar 2026', maturityDate: '20 Sep 2026', status: 'Active' },
];

const FixedDeposits = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenure, setSelectedTenure] = useState('');

  const handleTenureChange = (e) => {
    setSelectedTenure(e.target.value);
  };

  const getRate = () => {
    const plan = FD_PLANS.find(p => p.tenure === selectedTenure);
    return plan ? plan.rate : '0%';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Fixed Deposits</h2>
          <p>High-yield secure investments for B-Trust customers</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Open Fixed Deposit
        </button>
      </div>

      <div className="plans-grid">
        {FD_PLANS.map(plan => {
          const Icon = plan.icon;
          return (
            <div key={plan.id} className={`fd-plan-card bg-${plan.color}-gradient`}>
              <div className="fd-plan-icon">
                <Icon size={32} />
              </div>
              <h4>{plan.tenure}</h4>
              <div className="fd-rate">
                <span className="rate-value">{plan.rate}</span>
                <span className="rate-label">Interest Rate (p.a.)</span>
              </div>
              <p className="fd-desc">Interest posted monthly to linked savings account</p>
            </div>
          )
        })}
      </div>

      <div className="card table-card mt-6">
        <div className="card-header" style={{padding: '24px 24px 0', marginBottom: '16px'}}>
          <h3>Active Fixed Deposits</h3>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>FD No</th>
                <th>Linked Account</th>
                <th>Customer</th>
                <th>Principal Amount</th>
                <th>Tenure / Rate</th>
                <th>Opened / Maturity Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_FDS.map(fd => (
                <tr key={fd.fdNo}>
                  <td className="font-medium text-yellow-600">{fd.fdNo}</td>
                  <td>{fd.accNo}</td>
                  <td>{fd.customer}</td>
                  <td className="font-medium">{fd.principal}</td>
                  <td>
                    <div>{fd.tenure}</div>
                    <div className="text-muted" style={{fontSize: '0.75rem'}}>{fd.rate}</div>
                  </td>
                  <td>
                    <div>{fd.openDate}</div>
                    <div className="text-muted" style={{fontSize: '0.75rem'}}>Mat: {fd.maturityDate}</div>
                  </td>
                  <td>
                    <span className="badge badge-success">{fd.status}</span>
                  </td>
                </tr>
              ))}
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
            <div className="modal-body">
              <div className="alert-box warning mb-4">
                <strong>Business Rule:</strong> Only one fixed deposit can be created per savings account. 
                Interest will be credited automatically to this linked account every 30 days.
              </div>
              
              <form className="form-grid">
                <div className="form-group col-span-2">
                  <label>Link to Savings Account</label>
                  <select>
                    <option>Select an active savings account...</option>
                    <option>SV-49321 - Nimal Perera (Eligible)</option>
                    <option>SV-78310 - Kamal Silva (Already has FD) [DISABLED]</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>FD Tenure</label>
                  <select value={selectedTenure} onChange={handleTenureChange}>
                    <option value="">Select tenure...</option>
                    {FD_PLANS.map(plan => (
                      <option key={plan.id} value={plan.tenure}>{plan.tenure}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Applicable Interest Rate</label>
                  <input type="text" value={getRate()} disabled className="bg-slate-50 font-bold text-green-600" />
                </div>

                <div className="form-group col-span-2">
                  <label>Principal Deposit Amount (LKR)</label>
                  <div className="amount-input-wrapper">
                    <span className="currency">Rs.</span>
                    <input type="number" placeholder="0.00" className="amount-input text-yellow-600" />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setIsModalOpen(false)}>Create Fixed Deposit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedDeposits;

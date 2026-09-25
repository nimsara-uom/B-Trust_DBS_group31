import React, { useState } from 'react';
import { Wallet, Plus, ArrowRight, ShieldCheck, UserCircle, Users } from 'lucide-react';
import './Accounts.css';

const SAVINGS_PLANS = [
  { id: 'children', name: 'Children', rate: '12%', min: 'None', desc: 'Secure the future for those under 13 years.', icon: ShieldCheck, color: 'blue' },
  { id: 'teen', name: 'Teen', rate: '11%', min: 'Rs. 500', desc: 'For ages 13-17 to start building financial habits.', icon: UserCircle, color: 'purple' },
  { id: 'adult', name: 'Adult', rate: '10%', min: 'Rs. 1,000', desc: 'Standard savings account for ages 18-59.', icon: Wallet, color: 'green' },
  { id: 'senior', name: 'Senior', rate: '13%', min: 'Rs. 1,000', desc: 'Premium rates for our customers aged 60+.', icon: ShieldCheck, color: 'yellow' },
  { id: 'joint', name: 'Joint', rate: '7%', min: 'Rs. 5,000', desc: 'Shared savings for two or more account holders.', icon: Users, color: 'pink' }
];

const MOCK_ACCOUNTS = [
  { accNo: 'SV-49321', customer: 'Nimal Perera', plan: 'Adult', rate: '10%', balance: 'Rs. 52,000.00', status: 'Active', date: '10 Jan 2026' },
  { accNo: 'SV-78310', customer: 'Kamal Silva', plan: 'Joint', rate: '7%', balance: 'Rs. 120,250.00', status: 'Active', date: '15 Feb 2026' },
  { accNo: 'SV-23094', customer: 'Saman Kumara', plan: 'Senior', rate: '13%', balance: 'Rs. 450,000.00', status: 'Active', date: '20 Mar 2026' },
];

const Accounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Savings Accounts</h2>
          <p>Manage customer savings and plans</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Open Savings Account
        </button>
      </div>

      <h3 className="section-title">Available Savings Plans</h3>
      <div className="plans-grid">
        {SAVINGS_PLANS.map(plan => {
          const Icon = plan.icon;
          return (
            <div key={plan.id} className="plan-card">
              <div className={`plan-icon bg-${plan.color}-100 text-${plan.color}-600`}>
                <Icon size={24} />
              </div>
              <h4>{plan.name} Savings</h4>
              <p>{plan.desc}</p>
              
              <div className="plan-details">
                <div className="detail">
                  <span>Interest Rate</span>
                  <strong>{plan.rate}</strong>
                </div>
                <div className="detail">
                  <span>Min Balance</span>
                  <strong>{plan.min}</strong>
                </div>
              </div>
              
              <button 
                className="plan-action-btn"
                onClick={() => {
                  setSelectedPlan(plan.name);
                  setIsModalOpen(true);
                }}
              >
                Select Plan <ArrowRight size={16} />
              </button>
            </div>
          )
        })}
      </div>

      <h3 className="section-title mt-6">Recent Accounts</h3>
      <div className="card table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Account No</th>
                <th>Customer</th>
                <th>Plan</th>
                <th>Interest Rate</th>
                <th>Current Balance</th>
                <th>Status</th>
                <th>Opened Date</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ACCOUNTS.map(acc => (
                <tr key={acc.accNo}>
                  <td className="font-medium text-blue-600">{acc.accNo}</td>
                  <td>{acc.customer}</td>
                  <td><span className="badge badge-outline">{acc.plan}</span></td>
                  <td>{acc.rate}</td>
                  <td className="font-medium">{acc.balance}</td>
                  <td>
                    <span className="badge badge-success">{acc.status}</span>
                  </td>
                  <td>{acc.date}</td>
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
              <h3>Open Savings Account</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="form-grid">
                <div className="form-group col-span-2">
                  <label>Customer ID or Name</label>
                  <select>
                    <option>Select a customer...</option>
                    <option>CUST-001 - Nimal Perera</option>
                    <option>CUST-002 - Kamal Silva</option>
                  </select>
                </div>
                
                <div className="form-group col-span-2">
                  <label>Savings Plan</label>
                  <div className="plan-selector">
                    {SAVINGS_PLANS.map(plan => (
                      <div 
                        key={plan.id} 
                        className={`plan-option ${selectedPlan === plan.name ? 'selected' : ''}`}
                        onClick={() => setSelectedPlan(plan.name)}
                      >
                        <strong>{plan.name}</strong>
                        <span>{plan.rate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Initial Deposit Amount (LKR)</label>
                  <input type="number" placeholder="e.g. 5000" />
                </div>
                
                <div className="form-group">
                  <label>Branch</label>
                  <select>
                    <option>Colombo Main</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Assigned Agent</label>
                  <select>
                    <option>Agent 001</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setIsModalOpen(false)}>Create Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;

import React, { useState, useEffect } from 'react';
import { Calculator, Play, CheckCircle2, AlertTriangle, FileText, Clock, RefreshCw } from 'lucide-react';
import './InterestManagement.css';
import { runInterestEngine, getMonthlyInterestDistribution, getActiveFDsReport } from '../api';

const InterestManagement = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [distributions, setDistributions] = useState([]);
  const [activeFDs, setActiveFDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runDate, setRunDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [executionMessage, setExecutionMessage] = useState(null);
  const [error, setError] = useState(null);

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

  const handleRunEngine = async () => {
    setShowConfirmModal(false);
    setIsRunning(true);
    setError(null);
    setExecutionMessage(null);

    try {
      const res = await runInterestEngine(runDate, 1);
      setExecutionMessage(res.data?.message || 'Monthly interest engine executed successfully.');
      await loadEngineData();
    } catch (err) {
      console.error('Error running interest engine:', err);
      setError(err.response?.data?.detail || 'Engine execution failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const formatCurrency = (val) => {
    return 'Rs. ' + Number(val || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalEstInterest = activeFDs.reduce((acc, fd) => {
    const p = parseFloat(fd.principal_amount || 0);
    const r = parseFloat(fd.interest_rate || 0) / 100;
    return acc + (p * r / 12);
  }, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Interest Management</h2>
          <p>Automated Monthly Interest Engine (stored procedure sp_RunMonthlyEngine)</p>
        </div>
        <button className="btn-outline" onClick={loadEngineData}>
          <RefreshCw size={18} /> Refresh Records
        </button>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {executionMessage && (
        <div className="card" style={{ backgroundColor: '#D1FAE5', color: '#065F46', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px' }}>
          <CheckCircle2 size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
          {executionMessage}
        </div>
      )}

      <div className="engine-card card">
        <div className="engine-header">
          <div className="engine-icon bg-yellow-100 text-yellow-600">
            <Calculator size={32} />
          </div>
          <div className="engine-title">
            <h3>Monthly Interest Engine</h3>
            <p>Calculates and posts Fixed Deposit interest to linked Savings Accounts</p>
          </div>
        </div>

        <div className="engine-stats">
          <div className="stat-item">
            <span className="label"><FileText size={16}/> Active FDs</span>
            <span className="value">{loading ? '...' : `${activeFDs.length} FDs`}</span>
          </div>
          <div className="stat-item">
            <span className="label"><Clock size={16}/> Total Interest History</span>
            <span className="value">{loading ? '...' : `${distributions.length} Postings`}</span>
          </div>
          <div className="stat-item">
            <span className="label">Est. Monthly Payout</span>
            <span className="value text-green-600 font-bold">{loading ? '...' : formatCurrency(totalEstInterest)}</span>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#64748B', display: 'block', marginBottom: '4px' }}>Processing Run Date</label>
            <input 
              type="date" 
              value={runDate} 
              onChange={(e) => setRunDate(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
            />
          </div>
          <button 
            className="btn-primary run-engine-btn" 
            onClick={() => setShowConfirmModal(true)}
            disabled={isRunning}
            style={{ marginTop: 'auto' }}
          >
            <Play size={20} /> {isRunning ? 'Running Engine in DB...' : 'Run Monthly Interest Engine'}
          </button>
        </div>
      </div>

      <div className="results-card card mt-6">
        <div className="card-header">
          <h3>Interest Distribution Audit History ({distributions.length})</h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Year / Month</th>
                <th>FD ID</th>
                <th>Account No</th>
                <th>Customer Name</th>
                <th>FD Plan</th>
                <th>Credits Count</th>
                <th>Total Interest Credited</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    Loading audit records...
                  </td>
                </tr>
              ) : distributions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    No interest distribution history found in database.
                  </td>
                </tr>
              ) : (
                distributions.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-medium">{item.year} - {String(item.month).padStart(2, '0')}</td>
                    <td>FD-{String(item.fd_id).padStart(4, '0')}</td>
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Interest Engine Execution</h3>
              <button className="close-btn" onClick={() => setShowConfirmModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert-box warning mb-4 flex gap-2" style={{ padding: '0.75rem', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '6px' }}>
                <AlertTriangle size={24} className="shrink-0" />
                <div>
                  <strong>Notice:</strong> This executes `sp_RunMonthlyEngine` in MySQL for date <strong>{runDate}</strong>.
                  It computes interest for active FDs and inserts `FD_Interest` credit transactions into the linked savings accounts.
                </div>
              </div>
              <p>Execute monthly interest engine now?</p>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleRunEngine}>Yes, Execute Engine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestManagement;

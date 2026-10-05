import React, { useState, useEffect } from 'react';
import { Calculator, Play, CheckCircle2, AlertTriangle, FileText, Clock, RefreshCw } from 'lucide-react';
import './InterestManagement.css';

const InterestManagement = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleRunEngine = () => {
    setShowConfirmModal(false);
    setIsRunning(true);
    setProgress(0);
    setShowResults(false);
  };

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsRunning(false);
            setShowResults(true);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Interest Management</h2>
          <p>Automated Monthly Interest Engine</p>
        </div>
      </div>

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
            <span className="label"><Clock size={16}/> Last Execution</span>
            <span className="value">30 Jun 2026 23:59 PM</span>
          </div>
          <div className="stat-item">
            <span className="label"><RefreshCw size={16}/> Next Scheduled</span>
            <span className="value">30 Jul 2026 23:59 PM</span>
          </div>
          <div className="stat-item">
            <span className="label"><FileText size={16}/> Eligible Accounts</span>
            <span className="value">845 FDs</span>
          </div>
          <div className="stat-item">
            <span className="label">Total Est. Interest</span>
            <span className="value text-green-600 font-bold">Rs. 1,245,600.00</span>
          </div>
        </div>

        {isRunning ? (
          <div className="engine-progress">
            <div className="progress-text">
              <span>Processing Accounts...</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <button 
            className="btn-primary run-engine-btn" 
            onClick={() => setShowConfirmModal(true)}
            disabled={showResults}
          >
            <Play size={20} /> Run Monthly Interest Engine
          </button>
        )}
      </div>

      {showResults && (
        <div className="results-card card fade-in">
          <div className="card-header">
            <h3>Execution Results</h3>
            <span className="badge badge-success"><CheckCircle2 size={14}/> Completed Successfully</span>
          </div>
          
          <div className="summary-grid">
            <div className="summary-box">
              <h4>Accounts Processed</h4>
              <span>845</span>
            </div>
            <div className="summary-box success">
              <h4>Interest Credited</h4>
              <span>Rs. 1,245,600.00</span>
            </div>
            <div className="summary-box warning">
              <h4>Accounts Skipped</h4>
              <span>2</span>
            </div>
            <div className="summary-box error">
              <h4>Errors</h4>
              <span>0</span>
            </div>
          </div>

          <h4 className="mt-6 mb-4 font-medium">Interest Posting Audit Log</h4>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Fixed Deposit ID</th>
                  <th>Savings Account</th>
                  <th>Customer</th>
                  <th>Interest Posted</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-muted">AUD-10024</td>
                  <td>FD-9982</td>
                  <td>SV-49321</td>
                  <td>Nimal Perera</td>
                  <td className="text-green-600 font-medium">+ Rs. 1,450.00</td>
                  <td>30 Jul 2026 10:45:01 AM</td>
                </tr>
                <tr>
                  <td className="text-muted">AUD-10025</td>
                  <td>FD-9983</td>
                  <td>SV-78310</td>
                  <td>Kamal Silva</td>
                  <td className="text-green-600 font-medium">+ Rs. 5,200.00</td>
                  <td>30 Jul 2026 10:45:01 AM</td>
                </tr>
                <tr>
                  <td className="text-muted">AUD-10026</td>
                  <td>FD-9984</td>
                  <td>SV-23094</td>
                  <td>Saman Kumara</td>
                  <td className="text-green-600 font-medium">+ Rs. 12,000.00</td>
                  <td>30 Jul 2026 10:45:02 AM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Manual Execution</h3>
              <button className="close-btn" onClick={() => setShowConfirmModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert-box warning mb-4 flex gap-2">
                <AlertTriangle size={24} className="shrink-0" />
                <div>
                  <strong>Warning:</strong> You are about to manually trigger the Monthly Interest Engine. 
                  This operation cannot be reversed once completed. It will process all eligible fixed deposits and credit interest to their linked savings accounts.
                </div>
              </div>
              <p>Are you sure you want to proceed?</p>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleRunEngine}>Yes, Run Engine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestManagement;

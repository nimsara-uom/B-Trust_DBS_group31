import React, { useState, useEffect } from 'react';
import './Agents.css';
import { Users, Phone, MapPin, Activity, RefreshCw, UserPlus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { getAgents, createAgent, getBranches } from '../api';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [formData, setFormData] = useState({
    agent_name: '',
    branch_id: '',
    phone: ''
  });

  useEffect(() => {
    loadAgents();
    loadBranches();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAgents();
      setAgents(res.data || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to fetch agents from database.');
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const res = await getBranches();
      setBranches(res.data || []);
      if (res.data && res.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          branch_id: prev.branch_id || String(res.data[0].branch_id)
        }));
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const handleOpenModal = () => {
    setModalError(null);
    setFormData({
      agent_name: '',
      branch_id: branches.length > 0 ? String(branches[0].branch_id) : '1',
      phone: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.agent_name.trim()) {
      setModalError('Agent Name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setModalError('Phone number is required.');
      return;
    }

    try {
      setSubmitting(true);
      await createAgent({
        agent_name: formData.agent_name.trim(),
        branch_id: parseInt(formData.branch_id, 10),
        phone: formData.phone.trim()
      });

      setSuccessMsg(`Agent "${formData.agent_name.trim()}" registered successfully!`);
      setTimeout(() => setSuccessMsg(null), 5000);
      handleCloseModal();
      loadAgents();
    } catch (err) {
      console.error('Error registering agent:', err);
      setModalError(err.response?.data?.detail || 'Failed to register agent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container agents-page">
      <div className="page-header">
        <div>
          <h2>Agents Management</h2>
          <p className="page-subtitle">Oversee registered banking agents, their assigned branches, and transaction activity.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" onClick={loadAgents}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button className="btn-primary" onClick={handleOpenModal}>
            <UserPlus size={18} /> Register Agent
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="card alert-success">
          <CheckCircle size={20} color="#15803D" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="card alert-error">
          <AlertCircle size={20} color="#B91C1C" />
          <span>{error}</span>
        </div>
      )}

      <div className="card table-card">
        <div className="card-header" style={{ padding: '24px 24px 0', marginBottom: '16px' }}>
          <h3>All Registered Agents ({agents.length})</h3>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Agent ID</th>
                <th>Agent Name</th>
                <th>Branch</th>
                <th>Phone</th>
                <th>Total Customers</th>
                <th>Processed Transactions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    Loading agents...
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    No agents registered yet. Click "Register Agent" to add one.
                  </td>
                </tr>
              ) : (
                agents.map(agent => (
                  <tr key={agent.agent_id}>
                    <td className="font-medium text-blue-600">AGT-{String(agent.agent_id).padStart(3, '0')}</td>
                    <td className="font-medium">{agent.agent_name}</td>
                    <td>{agent.branch_name || `Branch #${agent.branch_id}`}</td>
                    <td>{agent.phone}</td>
                    <td>{agent.total_customers ?? 0} Customers</td>
                    <td>{agent.total_transactions ?? 0} Transactions</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Agent Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div className="modal-title-group">
                <div className="modal-avatar-gem">👔</div>
                <div>
                  <h3>Register New Agent</h3>
                  <p>Add a new field officer or banking agent to the system</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="modal-error-box">
                <AlertCircle size={18} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="agent-form">
              <div className="form-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="agent_name"
                  value={formData.agent_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Kasun Fernando"
                  required
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label>Assigned Branch *</label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleInputChange}
                  required
                >
                  {branches.length > 0 ? (
                    branches.map(b => (
                      <option key={b.branch_id} value={b.branch_id}>
                        {b.branch_name} ({b.city || 'Branch #' + b.branch_id})
                      </option>
                    ))
                  ) : (
                    <option value="1">Branch #1</option>
                  )}
                </select>
              </div>

              <div className="form-field">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 0771234567"
                  required
                />
                <small className="field-hint">Must be unique for each banking agent.</small>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : 'Register Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;

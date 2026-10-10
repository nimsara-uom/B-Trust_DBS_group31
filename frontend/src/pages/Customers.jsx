import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Eye, RefreshCw } from 'lucide-react';
import './Customers.css';
import { getCustomers, createCustomer, getBranches, getAgents } from '../api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    dob: '',
    phone: '',
    email: '',
    branch_id: '',
    agent_id: '',
    customer_type: 'Individual'
  });

  useEffect(() => {
    loadCustomers();
    loadMetadata();
  }, []);

  const loadCustomers = async (searchTerm = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomers(searchTerm);
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Could not load customers from database.');
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [branchRes, agentRes] = await Promise.all([
        getBranches(),
        getAgents()
      ]);
      setBranches(branchRes.data || []);
      setAgents(agentRes.data || []);
      if (branchRes.data && branchRes.data.length > 0) {
        setFormData(prev => ({ ...prev, branch_id: branchRes.data[0].branch_id }));
      }
      if (agentRes.data && agentRes.data.length > 0) {
        setFormData(prev => ({ ...prev, agent_id: agentRes.data[0].agent_id }));
      }
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    loadCustomers(val);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.national_id || !formData.dob || !formData.phone || !formData.branch_id || !formData.agent_id) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createCustomer({
        ...formData,
        branch_id: parseInt(formData.branch_id),
        agent_id: parseInt(formData.agent_id),
      });
      setFormSuccess('Customer registered successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
      }, 1000);
      loadCustomers(search);
    } catch (err) {
      console.error('Error creating customer:', err);
      alert(err.response?.data?.detail || 'Failed to register customer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p>Manage B-Trust microfinance customers from database</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Register Customer
        </button>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="card table-card">
        <div className="table-toolbar">
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search customers by name, NIC or phone..." 
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <button className="btn-outline" onClick={() => loadCustomers(search)}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>NIC</th>
                <th>Phone</th>
                <th>Branch</th>
                <th>Agent</th>
                <th>DOB</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    Loading customers from database...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#7F8C8D' }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map(cust => (
                  <tr key={cust.customer_id}>
                    <td className="font-medium">CUST-{String(cust.customer_id).padStart(3, '0')}</td>
                    <td>{cust.full_name}</td>
                    <td>{cust.national_id}</td>
                    <td>{cust.phone}</td>
                    <td>{cust.branch_name || `Branch #${cust.branch_id}`}</td>
                    <td>{cust.agent_name || `Agent #${cust.agent_id}`}</td>
                    <td>{cust.dob}</td>
                    <td>
                      <span className={`badge ${cust.customer_type === 'Individual' ? 'badge-success' : 'badge-warning'}`}>
                        {cust.customer_type || 'Individual'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="pagination">
          <span>Showing {customers.length} entries</span>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register New Customer</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            {formSuccess && (
              <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.75rem', margin: '1rem', borderRadius: '6px' }}>
                {formSuccess}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      name="full_name"
                      required
                      placeholder="e.g. Nimal Perera" 
                      value={formData.full_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>NIC Number *</label>
                    <input 
                      type="text" 
                      name="national_id"
                      required
                      placeholder="e.g. 199012345678" 
                      value={formData.national_id}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input 
                      type="date" 
                      name="dob"
                      required
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input 
                      type="text" 
                      name="phone"
                      required
                      placeholder="e.g. 071 234 5678" 
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email (Optional)</label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="e.g. nimal@example.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Branch *</label>
                    <select 
                      name="branch_id"
                      value={formData.branch_id}
                      onChange={handleInputChange}
                      required
                    >
                      {branches.map(b => (
                        <option key={b.branch_id} value={b.branch_id}>
                          {b.branch_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assigned Agent *</label>
                    <select 
                      name="agent_id"
                      value={formData.agent_id}
                      onChange={handleInputChange}
                      required
                    >
                      {agents.map(a => (
                        <option key={a.agent_id} value={a.agent_id}>
                          {a.agent_name} ({a.branch_name || 'Agent'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

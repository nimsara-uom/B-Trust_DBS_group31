import React, { useState, useEffect } from 'react';
import './Agents.css';
import { Users, Phone, MapPin, Activity, RefreshCw } from 'lucide-react';
import { getAgents } from '../api';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAgents();
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

  return (
    <div className="page-container agents-page">
      <div className="page-header">
        <div>
          <h2>Agents Management</h2>
          <p>Field banking agents and performance metrics from database</p>
        </div>
        <button className="btn-outline" onClick={loadAgents}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px' }}>
          {error}
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
                    No agents registered.
                  </td>
                </tr>
              ) : (
                agents.map(agent => (
                  <tr key={agent.agent_id}>
                    <td className="font-medium text-blue-600">AGT-{String(agent.agent_id).padStart(3, '0')}</td>
                    <td className="font-medium">{agent.agent_name}</td>
                    <td>{agent.branch_name || `Branch #${agent.branch_id}`}</td>
                    <td>{agent.phone}</td>
                    <td>{agent.total_customers} Customers</td>
                    <td>{agent.total_transactions} Transactions</td>
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

export default Agents;

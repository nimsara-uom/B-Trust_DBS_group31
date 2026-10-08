import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';
import './Customers.css';

const MOCK_CUSTOMERS = [
  { id: 'CUST-001', name: 'Nimal Perera', nic: '198512345678', phone: '071 234 5678', branch: 'Colombo Main', date: '10 Jan 2026', status: 'Active' },
  { id: 'CUST-002', name: 'Kamal Silva', nic: '199012345678', phone: '077 987 6543', branch: 'Kandy', date: '15 Feb 2026', status: 'Active' },
  { id: 'CUST-003', name: 'Saman Kumara', nic: '197512345678', phone: '075 456 7890', branch: 'Galle', date: '20 Mar 2026', status: 'Inactive' },
  { id: 'CUST-004', name: 'Sunil Shantha', nic: '198212345678', phone: '072 345 6789', branch: 'Colombo Main', date: '05 Apr 2026', status: 'Active' },
  { id: 'CUST-005', name: 'Amila Fernando', nic: '199512345678', phone: '078 123 4567', branch: 'Kandy', date: '12 May 2026', status: 'Active' },
];

const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p>Manage B-Trust microfinance customers</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Register Customer
        </button>
      </div>

      <div className="card table-card">
        <div className="table-toolbar">
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search customers by name, ID or NIC..." />
          </div>
          <button className="btn-outline"><Filter size={18} /> Filter</button>
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
                <th>Registered Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CUSTOMERS.map(cust => (
                <tr key={cust.id}>
                  <td className="font-medium">{cust.id}</td>
                  <td>{cust.name}</td>
                  <td>{cust.nic}</td>
                  <td>{cust.phone}</td>
                  <td>{cust.branch}</td>
                  <td>{cust.date}</td>
                  <td>
                    <span className={`badge ${cust.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {cust.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn text-blue-600"><Eye size={18}/></button>
                      <button className="icon-btn text-slate-500"><Edit2 size={18}/></button>
                      <button className="icon-btn text-red-600"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="pagination">
          <span>Showing 1 to 5 of 5 entries</span>
          <div className="page-controls">
            <button disabled>Prev</button>
            <button className="active">1</button>
            <button disabled>Next</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register New Customer</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="form-grid">
                <div className="form-group col-span-2">
                  <label>Full Name</label>
                  <input type="text" placeholder="e.g. John Doe" />
                </div>
                <div className="form-group">
                  <label>NIC Number</label>
                  <input type="text" placeholder="e.g. 199012345678" />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" />
                </div>
                <div className="form-group col-span-2">
                  <label>Address</label>
                  <input type="text" placeholder="e.g. 123 Main St, Colombo" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" placeholder="e.g. 071 234 5678" />
                </div>
                <div className="form-group">
                  <label>Email (Optional)</label>
                  <input type="email" placeholder="e.g. john@example.com" />
                </div>
                <div className="form-group">
                  <label>Branch</label>
                  <select>
                    <option>Colombo Main</option>
                    <option>Kandy</option>
                    <option>Galle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assigned Agent</label>
                  <select>
                    <option>Agent 001 - Silva</option>
                    <option>Agent 002 - Perera</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setIsModalOpen(false)}>Save Customer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

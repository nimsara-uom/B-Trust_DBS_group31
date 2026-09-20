import React from 'react';
import { FileBarChart, Download, Eye, Calendar, Users, Wallet, Activity } from 'lucide-react';
import './Reports.css';

const REPORTS = [
  { id: 1, title: 'Customer Activity Report', desc: 'Summary of new registrations and customer status changes.', icon: Users, color: 'blue' },
  { id: 2, title: 'Savings Account Summary', desc: 'Balances and status across all savings plans (Children, Teen, Adult, etc.).', icon: Wallet, color: 'green' },
  { id: 3, title: 'Transaction History', desc: 'Detailed log of deposits, withdrawals, and interest credits.', icon: Activity, color: 'purple' },
  { id: 4, title: 'Fixed Deposit Portfolio', desc: 'Active FDs, upcoming maturities, and total principal.', icon: Wallet, color: 'yellow' },
  { id: 5, title: 'Monthly Interest Distribution', desc: 'Audit report of automated interest engine executions.', icon: FileBarChart, color: 'pink' },
  { id: 6, title: 'Agent Performance', desc: 'Transaction volumes and customer acquisitions by agent.', icon: Users, color: 'slate' }
];

const Reports = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Management Reports</h2>
          <p>Generate and export system reports for B-Trust operations</p>
        </div>
      </div>

      <div className="card report-filters-card mb-6">
        <h3 className="text-md font-medium mb-4">Global Report Filters</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Date Range</label>
            <div className="flex gap-2">
              <input type="date" className="w-full" />
              <span className="flex items-center">to</span>
              <input type="date" className="w-full" />
            </div>
          </div>
          <div className="form-group">
            <label>Branch</label>
            <select><option>All Branches</option><option>Colombo Main</option></select>
          </div>
          <div className="form-group">
            <label>Agent</label>
            <select><option>All Agents</option><option>Agent 001</option></select>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        {REPORTS.map(report => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="report-card card">
              <div className="report-header">
                <div className={`report-icon bg-${report.color}-100 text-${report.color}-600`}>
                  <Icon size={24} />
                </div>
                <h3>{report.title}</h3>
              </div>
              <p className="report-desc">{report.desc}</p>
              
              <div className="report-actions">
                <button className="btn-outline flex-1"><Eye size={16}/> View</button>
                <button className="btn-primary-yellow flex-1"><Download size={16}/> Export CSV</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Reports;

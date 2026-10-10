import React, { useState } from 'react';
import { FileBarChart, Download, Eye, Users, Wallet, Activity, X } from 'lucide-react';
import './Reports.css';
import {
  getAgentTransactionSummary,
  getAccountTransactionSummary,
  getActiveFDsReport,
  getMonthlyInterestDistribution,
  getCustomerActivitySummary,
  getMonthlyBankTransactionSummary,
} from '../api';

const REPORTS = [
  { 
    id: 1, 
    title: 'Agent Transaction Summary', 
    desc: 'Transaction volumes, total deposits, and withdrawals by agent.', 
    icon: Users, 
    color: 'slate',
    fetcher: getAgentTransactionSummary 
  },
  { 
    id: 2, 
    title: 'Savings Account Summary', 
    desc: 'Transaction count, total amount, and current balance across accounts.', 
    icon: Wallet, 
    color: 'green',
    fetcher: getAccountTransactionSummary 
  },
  { 
    id: 3, 
    title: 'Active Fixed Deposits Portfolio', 
    desc: 'Active FDs, principal amounts, interest rates, and upcoming payout dates.', 
    icon: Wallet, 
    color: 'yellow',
    fetcher: getActiveFDsReport 
  },
  { 
    id: 4, 
    title: 'Monthly Interest Distribution', 
    desc: 'Audit report of monthly automated interest engine calculations.', 
    icon: FileBarChart, 
    color: 'pink',
    fetcher: getMonthlyInterestDistribution 
  },
  { 
    id: 5, 
    title: 'Customer Activity Summary', 
    desc: 'Deposits, withdrawals, and net balance activity grouped by customer.', 
    icon: Users, 
    color: 'blue',
    fetcher: getCustomerActivitySummary 
  },
  { 
    id: 6, 
    title: 'Monthly Bank Transaction Summary', 
    desc: 'Aggregated monthly deposits, withdrawals, and net fund movements.', 
    icon: Activity, 
    color: 'purple',
    fetcher: getMonthlyBankTransactionSummary 
  }
];

const Reports = () => {
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleViewReport = async (report) => {
    setActiveReport(report);
    setLoading(true);
    setError(null);
    setReportData([]);

    try {
      const res = await report.fetcher();
      setReportData(res.data || []);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to fetch report from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async (report) => {
    try {
      const res = await report.fetcher();
      const data = res.data || [];
      if (data.length === 0) {
        alert('No data available to export.');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
          return `"${val.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }

      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${report.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export CSV.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Management Reports</h2>
          <p>Generate, view live, and export official B-Trust database reports</p>
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
                <button className="btn-outline flex-1" onClick={() => handleViewReport(report)}>
                  <Eye size={16}/> View
                </button>
                <button className="btn-primary-yellow flex-1" onClick={() => handleExportCSV(report)}>
                  <Download size={16}/> Export CSV
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', width: '95%' }}>
            <div className="modal-header">
              <h3>{activeReport.title} ({reportData.length} records)</h3>
              <button className="close-btn" onClick={() => setActiveReport(null)}>×</button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  Loading report data from MySQL database...
                </div>
              ) : error ? (
                <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '6px' }}>
                  {error}
                </div>
              ) : reportData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  No records returned for this report.
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {Object.keys(reportData[0]).map(col => (
                          <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row, idx) => (
                        <tr key={idx}>
                          {Object.keys(reportData[0]).map(col => (
                            <td key={col}>
                              {typeof row[col] === 'number'
                                ? row[col].toLocaleString()
                                : String(row[col] ?? '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setActiveReport(null)}>Close</button>
              <button 
                className="btn-primary" 
                onClick={() => handleExportCSV(activeReport)}
                disabled={reportData.length === 0}
              >
                <Download size={16} /> Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

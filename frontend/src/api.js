import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  auth: {
    username: 'admin',
    password: 'admin',
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = () => api.get('/health');

// Dashboard
export const getDashboardStats = () => api.get('/api/dashboard/stats');

// Customers
export const getCustomers = (search) => 
  api.get('/api/customers', { params: search ? { search } : {} });
export const getCustomer = (id) => api.get(`/api/customers/${id}`);
export const createCustomer = (data) => api.post('/api/customers', data);

// Savings Accounts & Plans
export const getPlans = () => api.get('/api/plans');
export const getAccounts = (status, planId) => 
  api.get('/api/accounts', { params: { status, plan_id: planId } });
export const getAccount = (id) => api.get(`/api/accounts/${id}`);
export const createAccount = (data) => api.post('/api/accounts', data);

// Transactions
export const getTransactions = (params) => api.get('/api/transactions', { params });
export const depositMoney = (data) => api.post('/api/transactions/deposit', data);
export const withdrawMoney = (data) => api.post('/api/transactions/withdraw', data);

// Fixed Deposits
export const getFDPlans = () => api.get('/api/fixed-deposits/plans');
export const getFixedDeposits = (status, accountId) => 
  api.get('/api/fixed-deposits', { params: { status, account_id: accountId } });
export const createFixedDeposit = (data) => api.post('/api/fixed-deposits', data);
export const runInterestEngine = (runDate, systemAgentId = 1) => 
  api.post('/api/fixed-deposits/interest-engine/run', {
    p_RunDate: runDate,
    p_SystemAgentID: systemAgentId,
  });

// Agents & Branches
export const getAgents = () => api.get('/api/agents');
export const getBranches = () => api.get('/api/branches');

// Reports
export const getAgentTransactionSummary = () => 
  api.get('/api/reports/agent-transaction-summary');
export const getAccountTransactionSummary = () => 
  api.get('/api/reports/account-transaction-summary');
export const getActiveFDsReport = () => 
  api.get('/api/reports/active-fds');
export const getMonthlyInterestDistribution = () => 
  api.get('/api/reports/monthly-interest-distribution');
export const getCustomerActivitySummary = () => 
  api.get('/api/reports/customer-activity-summary');
export const getMonthlyBankTransactionSummary = () => 
  api.get('/api/reports/monthly-bank-transaction-summary');

export default api;

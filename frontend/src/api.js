import axios from 'axios';

// Retrieve stored credentials or fallback
const getAuthCredentials = () => {
  try {
    const stored = localStorage.getItem('btrust_auth');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // ignore
  }
  return { username: 'admin', password: 'admin' };
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const creds = getAuthCredentials();
  if (creds && creds.username && creds.password) {
    config.auth = {
      username: creds.username,
      password: creds.password,
    };
  }
  return config;
});

// Auth API
export const loginUser = (username, password) => 
  api.post('/api/auth/login', { username, password });

export const getHealth = () => api.get('/health');

// Dashboard
export const getDashboardStats = () => api.get('/api/dashboard/stats');

// Customers
export const getCustomers = (search) => 
  api.get('/api/customers', { params: search ? { search } : {} });
export const getCustomer = (id) => api.get(`/api/customers/${id}`);
export const createCustomer = (data) => api.post('/api/customers', data);
export const getCustomerPortalData = (customerId) => 
  api.get(`/api/customers/${customerId}/portal`);
export const transferCustomerFunds = (data) => 
  api.post('/api/customers/transfer', data);
export const changeCustomerPassword = (data) => 
  api.post('/api/customers/change-password', data);

// Savings Accounts & Plans
export const getPlans = () => api.get('/api/plans');
export const getAccounts = (status, planId, search, plan) => 
  api.get('/api/accounts', { params: { status, plan_id: planId, search, plan } });
export const getAccount = (id) => api.get(`/api/accounts/${id}`);
export const createAccount = (data) => api.post('/api/accounts', data);
export const updateAccountStatus = (accountId, status) =>
  api.patch(`/api/accounts/${accountId}/status`, { status });

// Transactions
export const getTransactions = (params) => api.get('/api/transactions', { params });
export const depositMoney = (data) => api.post('/api/transactions/deposit', data);
export const withdrawMoney = (data) => api.post('/api/transactions/withdraw', data);

// Fixed Deposits
export const getFDPlans = () => api.get('/api/fixed-deposits/plans');
export const getFixedDeposits = (status, accountId) => 
  api.get('/api/fixed-deposits', { params: { status, account_id: accountId } });
export const createFixedDeposit = (data) => api.post('/api/fixed-deposits', data);
export const closeFixedDeposit = (fdId) => 
  api.patch(`/api/fixed-deposits/${fdId}/close`);
export const runInterestEngine = (runDate, systemAgentId = 1) => 
  api.post('/api/fixed-deposits/interest-engine/run', {
    p_RunDate: runDate,
    p_SystemAgentID: systemAgentId,
  });

// Agents & Branches
export const getAgents = () => api.get('/api/agents');
export const createAgent = (data) => api.post('/api/agents', data);
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

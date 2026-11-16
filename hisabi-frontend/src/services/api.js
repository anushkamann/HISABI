import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log("API URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hisabi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hisabi_token');
      localStorage.removeItem('hisabi_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login    = (data) => api.post('/api/auth/login', data);
export const register = (data) => api.post('/api/auth/register', data);

// Transactions
export const getTransactions    = ()         => api.get('/api/transactions');
export const addTransaction     = (data)     => api.post('/api/transactions', data);
export const updateTransaction  = (id, data) => api.put(`/api/transactions/${id}`, data);
export const deleteTransaction  = (id)       => api.delete(`/api/transactions/${id}`);

// Budgets
export const getBudgets = ()     => api.get('/api/budgets');
export const addBudget  = (data) => api.post('/api/budgets', data);

// Categories
export const getCategories = () => api.get('/api/categories');

// Reports
export const getReports = () => api.get('/api/reports');

export default api;
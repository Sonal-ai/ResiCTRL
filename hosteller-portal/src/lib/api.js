import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend URL
  withCredentials: true
});

// Auto-inject token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const studentLogin = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  const token = res.data.data?.token || res.data?.token;
  if (token) {
    localStorage.setItem('token', token);
  }
  return res.data;
};

export const studentLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const getDashboardMetrics = () => api.get('/dashboard/metrics');
export const getRecentScans = () => api.get('/scans/recent');

// Apply leave
export const applyLeave = (data) => api.post('/leaves/apply', data);

// Simulate personal scan (student_id, type)
export const simulateScan = (data) => api.post('/scans/processScan', data);

export default api;

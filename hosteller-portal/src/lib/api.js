import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // Backend URL
  withCredentials: true
});

// Auto-inject token from localStorage
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const studentLogin = async (credentials) => {
  const res = await api.post('/auth/login/hosteller', credentials);
  const token = res.data.data?.token;
  if (token) {
    localStorage.setItem('token', token);
    // Also store the hosteller ID for API calls that need it
    localStorage.setItem('hostellerId', res.data.data.id);
  }
  return res.data;
};

export const studentLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('hostellerId');
  }
};

export const getDashboardMetrics = () => api.get('/dashboard/metrics');
export const getRecentScans = () => api.get('/scans/recent');

// Apply leave
export const applyLeave = (data) => api.post('/leaves/apply', data);

// Simulate personal scan (hosteller_id, type)
export const simulateScan = (data) => api.post('/scans/processScan', data);

export default api;

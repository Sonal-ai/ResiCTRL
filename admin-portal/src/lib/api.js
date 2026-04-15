import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // Backend URL
  withCredentials: true // For JWT cookies if used
});

// Auto-inject token from localStorage
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminLogin = async (credentials) => {
  const res = await api.post('/auth/login/admin', credentials);
  const token = res.data.data?.token;
  if (token) {
    localStorage.setItem('token', token);
  }
  return res.data;
};

export const adminLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const getDashboardMetrics = () => api.get('/dashboard/metrics');
export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getViolations = () => api.get('/dashboard/violations');
export const getRecentScans = () => api.get('/scans/recent');
export const getAllHostellers = () => api.get('/hostellers');

// For leaves
export const getLeaves = () => api.get('/leaves');
export const updateLeaveStatus = (id, status) => {
  if (status === 'approved') return api.put(`/leaves/${id}/approve`);
  return api.put(`/leaves/${id}/reject`);
};

// For hostellers
export const createHosteller = (data) => api.post('/hostellers', data);
export const uploadHostellerCSV = (formData) => api.post('/hostellers/upload-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
// For complaints
export const getComplaints = (params) => api.get('/complaints', { params });
export const getComplaintStats = () => api.get('/complaints/stats');
export const updateComplaintStatus = (id, data) => api.put(`/complaints/${id}/status`, data);

export default api;

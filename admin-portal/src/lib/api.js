import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // Backend URL
  withCredentials: true // For JWT cookies if used
});

// Auto-inject token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminLogin = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  const token = res.data.data?.token || res.data?.token;
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
export const getViolations = () => api.get('/dashboard/violations');
export const getRecentScans = () => api.get('/scans/recent');
export const getAllStudents = () => api.get('/students');

// For leaves
export const getLeaves = () => api.get('/leaves');
export const updateLeaveStatus = (id, status) => {
  if (status === 'APPROVED') return api.put(`/leaves/${id}/approve`);
  return api.put(`/leaves/${id}/reject`);
};

// For students
export const createStudent = (data) => api.post('/students', data);

export default api;

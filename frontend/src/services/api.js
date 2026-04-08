import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Connect to backend
});

export const getDashboardMetrics = () => api.get('/dashboard/metrics');
export const getViolations = () => api.get('/dashboard/violations');
export const getRecentScans = () => api.get('/scans/recent');
export const getAllStudents = () => api.get('/students');

export default api;

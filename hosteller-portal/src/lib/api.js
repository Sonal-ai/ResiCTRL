import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend URL
});

// Assuming hosteller dashboard gets specific metrics, currently using global for demo
export const getDashboardMetrics = () => api.get('/dashboard/metrics');
export const getRecentScans = () => api.get('/scans/recent');

// Apply leave
export const applyLeave = (data) => api.post('/leaves/apply', data);

// Simulate personal scan (student_id, type)
export const simulateScan = (data) => api.post('/scans/processScan', data);

export default api;

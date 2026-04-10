import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend URL
  withCredentials: true // For JWT cookies
});

// Auto-inject token if we store it
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginAdmin = async () => {
  try {
    // Attempt login, or register
    const res = await api.post('/auth/login', { email: 'admin@hostel.com', password: 'password123' });
    localStorage.setItem('token', res.data.data.token || res.data.token); // Adjust depending on backend
  } catch (err) {
    // If login fails, try register
    try {
      const res = await api.post('/auth/register', { email: 'admin@hostel.com', password: 'password123', role: 'WARDEN' });
      localStorage.setItem('token', res.data.data.token || res.data.token);
    } catch (e) {
      console.error('Auth setup failed');
    }
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

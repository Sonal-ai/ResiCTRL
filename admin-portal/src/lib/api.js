import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true
});

// ── Auth helpers ──

/**
 * Decode JWT payload without verification (client-side only).
 * Returns null if token is missing or malformed.
 */
export const decodeToken = () => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
};

/**
 * Check if the stored JWT token is expired.
 */
export const isTokenExpired = () => {
  const payload = decodeToken();
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

/**
 * Get authenticated user info from JWT, or null if expired/missing.
 */
export const getAuthUser = () => {
  if (isTokenExpired()) return null;
  return decodeToken();
};

// ── Interceptors ──

// Auto-inject token from localStorage
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 with tokenExpired flag
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.tokenExpired) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──

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

// ── Dashboard API ──
export const getDashboardMetrics = () => api.get('/dashboard/metrics');
export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getViolations = () => api.get('/dashboard/violations');
export const getRecentScans = () => api.get('/scans/recent');

// ── Hostellers API ──
export const getAllHostellers = (params) => api.get('/hostellers', { params });
export const getHostellerById = (id) => api.get(`/hostellers/${id}`);
export const createHosteller = (data) => api.post('/hostellers', data);
export const updateHosteller = (id, data) => api.put(`/hostellers/${id}`, data);  // NEW
export const uploadHostellerCSV = (formData) => api.post('/hostellers/upload-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// ── Leaves API ──
export const getLeaves = (params) => api.get('/leaves', { params });
export const updateLeaveStatus = (id, status) => {
  if (status === 'approved') return api.put(`/leaves/${id}/approve`);
  return api.put(`/leaves/${id}/reject`);
};

// ── Complaints API ──
export const getComplaints = (params) => api.get('/complaints', { params });
export const getComplaintStats = () => api.get('/complaints/stats');
export const updateComplaintStatus = (id, data) => api.put(`/complaints/${id}/status`, data);

// ── Notifications API ── (NEW)
export const getNotifications = (params) => api.get('/notifications', { params });
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

// ── Attendance API ── (NEW)
export const getAttendanceRegister = (params) => api.get('/attendance/register', { params });
export const getAttendanceDateRange = () => api.get('/attendance/date-range');

export default api;

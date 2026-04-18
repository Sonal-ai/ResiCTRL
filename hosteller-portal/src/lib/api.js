import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true
});

// ── Auth helpers ──

export const decodeToken = () => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
};

export const isTokenExpired = () => {
  const payload = decodeToken();
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

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

// Auto-logout on expired token (Phase 4.4)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.tokenExpired) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('hostellerId');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──

export const studentRegister = async (data) => {
  const res = await api.post('/auth/register/hosteller', data);
  const token = res.data.data?.token;
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('hostellerId', res.data.data.id);
  }
  return res.data;
};

export const studentLogin = async (credentials) => {
  const res = await api.post('/auth/login/hosteller', credentials);
  const token = res.data.data?.token;
  if (token) {
    localStorage.setItem('token', token);
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

// ── Profile API (NEW) ──
export const getMyProfile = () => {
  const id = typeof window !== 'undefined' ? localStorage.getItem('hostellerId') : null;
  if (!id) return Promise.reject(new Error('No hosteller ID found'));
  return api.get(`/hostellers/${id}`);
};

// ── Dashboard ──
export const getDashboardMetrics = () => api.get('/dashboard/metrics');
export const getRecentScans = () => api.get('/scans/recent');

// ── Scan ──
export const simulateScan = (data) => api.post('/scans/processScan', data);

// ── Leave ──
export const applyLeave = (data) => api.post('/leaves/apply', data);
export const getMyLeaves = () => api.get('/leaves/my');  // NEW — Phase 4.3

// ── Complaints ──
export const submitComplaint = (formData) => api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyComplaints = () => api.get('/complaints/my');

// ── Password ──
export const changePassword = (data) => api.post('/auth/update-password', data);  // NEW — Phase 4.2

// ── Notifications (NEW) ──
export const getNotifications = (params) => api.get('/notifications', { params });
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

// ── Elections API ──
export const getActiveElection = (params) => api.get('/elections/active', { params });
export const castVote = (data) => api.post('/elections/vote', data);
export const getElectionResults = (id) => api.get(`/elections/${id}/results`);

// ── Announcements API ──
export const getAnnouncements = (params) => api.get('/announcements', { params });

export default api;

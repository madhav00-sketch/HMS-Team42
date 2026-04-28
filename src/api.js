const BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('hms_token');
const saveToken = (tok) => localStorage.setItem('hms_token', tok);
export const clearToken = () => localStorage.removeItem('hms_token');

const request = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const login = async (user_id, password) => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ user_id, password }),
  });
  saveToken(data.token);
  return data.user;
};

export const logout = () => clearToken();
export const getComplaints = () => request('/complaints');
export const createComplaint = (body) => request('/complaints', { method: 'POST', body: JSON.stringify(body) });
export const updateComplaint = (id, body) => request(`/complaints/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const getRooms = () => request('/rooms');
export const getMyRoom = () => request('/rooms/my');
export const allocateRoom = (id, body) => request(`/rooms/${id}/allocate`, { method: 'POST', body: JSON.stringify(body) });
export const getUsers = (role) => request(`/users${role ? `?role=${role}` : ''}`);
export const getNotices = () => request('/notices');
export const createNotice = (body) => request('/notices', { method: 'POST', body: JSON.stringify(body) });
export const changePassword = (body) => request('/users/password', { method: 'PATCH', body: JSON.stringify(body) });
export const vacateRoom = (id, body) => request(`/rooms/${id}/vacate`, { method: 'POST', body: JSON.stringify(body) });

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getStaff = (params) => axios.get(`${BASE}/staff`, { params });
export const getStaffMember = (id) => axios.get(`${BASE}/staff/${id}`);
export const createStaff = (data) => axios.post(`${BASE}/staff`, data);
export const updateStaff = (id, data) => axios.put(`${BASE}/staff/${id}`, data);
export const deactivateStaff = (id) => axios.put(`${BASE}/staff/${id}/deactivate`);

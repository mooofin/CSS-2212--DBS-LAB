import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const getStaff = (params) => axios.get(`${API_BASE_URL}/staff`, { params });
export const getStaffMember = (id) => axios.get(`${API_BASE_URL}/staff/${id}`);
export const createStaff = (data) => axios.post(`${API_BASE_URL}/staff`, data);
export const updateStaff = (id, data) => axios.put(`${API_BASE_URL}/staff/${id}`, data);
export const deactivateStaff = (id) => axios.put(`${API_BASE_URL}/staff/${id}/deactivate`);

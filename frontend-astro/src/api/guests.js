import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const getGuests = (params) => axios.get(`${API_BASE_URL}/guests`, { params });
export const getGuest = (id) => axios.get(`${API_BASE_URL}/guests/${id}`);
export const createGuest = (data) => axios.post(`${API_BASE_URL}/guests`, data);
export const updateGuest = (id, data) => axios.put(`${API_BASE_URL}/guests/${id}`, data);
export const deleteGuest = (id) => axios.delete(`${API_BASE_URL}/guests/${id}`);

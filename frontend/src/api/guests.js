import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getGuests = (params) => axios.get(`${BASE}/guests`, { params });
export const getGuest = (id) => axios.get(`${BASE}/guests/${id}`);
export const createGuest = (data) => axios.post(`${BASE}/guests`, data);
export const updateGuest = (id, data) => axios.put(`${BASE}/guests/${id}`, data);
export const deleteGuest = (id) => axios.delete(`${BASE}/guests/${id}`);

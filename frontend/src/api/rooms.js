import axios from 'axios';

const BASE = '/api';

export const getRooms = (params) => axios.get(`${BASE}/rooms`, { params });
export const getRoom = (id) => axios.get(`${BASE}/rooms/${id}`);
export const createRoom = (data) => axios.post(`${BASE}/rooms`, data);
export const updateRoom = (id, data) => axios.put(`${BASE}/rooms/${id}`, data);
export const deleteRoom = (id) => axios.delete(`${BASE}/rooms/${id}`);
export const getRoomSummary = () => axios.get(`${BASE}/rooms/summary`);

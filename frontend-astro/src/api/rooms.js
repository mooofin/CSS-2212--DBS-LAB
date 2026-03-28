import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const getRooms = (params) => axios.get(`${API_BASE_URL}/rooms`, { params });
export const getRoom = (id) => axios.get(`${API_BASE_URL}/rooms/${id}`);
export const createRoom = (data) => axios.post(`${API_BASE_URL}/rooms`, data);
export const updateRoom = (id, data) => axios.put(`${API_BASE_URL}/rooms/${id}`, data);
export const deleteRoom = (id) => axios.delete(`${API_BASE_URL}/rooms/${id}`);
export const getRoomSummary = () => axios.get(`${API_BASE_URL}/rooms/summary`);

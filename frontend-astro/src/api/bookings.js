import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const getBookings = (params) => axios.get(`${API_BASE_URL}/bookings`, { params });
export const getBooking = (id) => axios.get(`${API_BASE_URL}/bookings/${id}`);
export const createBooking = (data) => axios.post(`${API_BASE_URL}/bookings`, data);
export const checkinBooking = (id) => axios.put(`${API_BASE_URL}/bookings/${id}/checkin`);
export const checkoutBooking = (id) => axios.put(`${API_BASE_URL}/bookings/${id}/checkout`);
export const cancelBooking = (id) => axios.put(`${API_BASE_URL}/bookings/${id}/cancel`);
export const getAvailability = (params) => axios.get(`${API_BASE_URL}/bookings/availability`, { params });

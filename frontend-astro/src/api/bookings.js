import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getBookings = (params) => axios.get(`${BASE}/bookings`, { params });
export const getBooking = (id) => axios.get(`${BASE}/bookings/${id}`);
export const createBooking = (data) => axios.post(`${BASE}/bookings`, data);
export const checkinBooking = (id) => axios.put(`${BASE}/bookings/${id}/checkin`);
export const checkoutBooking = (id) => axios.put(`${BASE}/bookings/${id}/checkout`);
export const cancelBooking = (id) => axios.put(`${BASE}/bookings/${id}/cancel`);
export const getAvailability = (params) => axios.get(`${BASE}/bookings/availability`, { params });

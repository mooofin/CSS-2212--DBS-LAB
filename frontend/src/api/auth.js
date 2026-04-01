import axios from 'axios';

const AUTH_URL = '/api/auth';
const CUSTOMER_URL = '/api/customer';

// Staff/Admin authentication
export const login = (credentials) => axios.post(`${AUTH_URL}/login`, credentials);

// Customer authentication
export const customerLogin = (credentials) => axios.post(`${CUSTOMER_URL}/login`, credentials);
export const customerRegister = (data) => axios.post(`${CUSTOMER_URL}/register`, data);
export const getCustomerProfile = (id) => axios.get(`${CUSTOMER_URL}/profile/${id}`);
export const updateCustomerProfile = (id, data) => axios.put(`${CUSTOMER_URL}/profile/${id}`, data);
export const getCustomerBookings = (id) => axios.get(`${CUSTOMER_URL}/bookings/${id}`);

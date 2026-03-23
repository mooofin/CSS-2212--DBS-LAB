import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getBills = () => axios.get(`${BASE}/billing`);
export const getBill = (bookingId) => axios.get(`${BASE}/billing/${bookingId}`);
export const payBill = (billId, data) => axios.put(`${BASE}/billing/${billId}/pay`, data);
export const getRevenueSummary = () => axios.get(`${BASE}/billing/revenue/summary`);

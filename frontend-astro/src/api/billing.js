import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const getBills = () => axios.get(`${API_BASE_URL}/billing`);
export const getBill = (bookingId) => axios.get(`${API_BASE_URL}/billing/${bookingId}`);
export const payBill = (billId, data) => axios.put(`${API_BASE_URL}/billing/${billId}/pay`, data);
export const getRevenueSummary = () => axios.get(`${API_BASE_URL}/billing/revenue/summary`);

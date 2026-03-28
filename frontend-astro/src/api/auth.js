import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const login = (credentials) => axios.post(`${API_BASE_URL}/auth/login`, credentials);

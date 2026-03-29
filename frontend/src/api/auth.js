import axios from 'axios';

const API_URL = '/api/auth';

export const login = (credentials) => axios.post(`${API_URL}/login`, credentials);

import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth';

export const login = (credentials) => axios.post(`${API_URL}/login`, credentials);

import axios from 'axios';
export const BASE_URL = 'http://localhost:3000'

// Gunakan import.meta.env untuk Vite
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: `${BASE_URL}/api`, // Pastikan ini sesuai dengan prefix API backendmu
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

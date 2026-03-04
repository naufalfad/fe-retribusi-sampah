import axios from 'axios';
export const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

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

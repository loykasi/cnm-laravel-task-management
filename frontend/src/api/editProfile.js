import axios from 'axios';
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export const editprofile = async (email, username, job, address, bio, avatar) => {
    const response = await api.post(`/editprofile`, { email, username, job, address, bio, avatar });
    return response.data;
};
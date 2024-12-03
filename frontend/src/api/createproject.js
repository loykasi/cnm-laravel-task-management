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
export const createproject = async (name, description, status, due_date) => {
    const email = localStorage.getItem("user_email");
    const formattedDueDate = new Date(due_date).toISOString().split('T')[0]; // '2025-03-15'
    const response = await api.post(`/createproject`, { email, name, description, status, dueDate: formattedDueDate });
    return response.data;
};

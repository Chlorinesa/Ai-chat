import { API_BASE_URL } from '../constants/api.js';

export async function client(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
        method: options.method || 'GET',
        headers,
    };

    if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(API_BASE_URL + endpoint, fetchOptions);

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            if (response.status === 403) {
                window.location.href = '/chat';
            }
            throw new Error(`HTTP error. status: ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();

    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    }
}
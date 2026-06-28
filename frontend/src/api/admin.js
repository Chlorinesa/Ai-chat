import { client } from './client';

export const apiGetUsers = (page = 1, perPage = 10) => {
    return client(`/admin/users?page=${page}&per_page=${perPage}`, { method: 'GET' });
};

export const apiCreateUser = (username, password, role = 'user') => {
    return client('/admin/users', { 
        method: 'POST', 
        body: { username, password, role } 
    });
};

export const apiUpdateUser = (userId, data) => {
    return client(`/admin/users/${userId}`, { 
        method: 'PATCH', 
        body: data 
    });
};

export const apiDeleteUser = (userId) => {
    return client(`/admin/users/${userId}`, { method: 'DELETE' });
};

export const apiGetStats = () => {
    return client('/admin/stats', { method: 'GET' });
};
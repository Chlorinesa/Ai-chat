import { client } from './client';

export const apiRegister = (username, password) => {
   return client('/auth/register', { method: 'POST', body: { username, password }});
};

export const apiLogin = (username, password) => {
    return client('/auth/login', { method: 'POST', body: { username, password }});
};
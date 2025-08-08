import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const registerUser = (userData) => API.post('/users/register', userData);
export const loginUser = (credentials) => API.post('/users/login', credentials);
export const getUser = (id) => API.get(`/users/${id}`);

export const addItem = (itemData) => API.post('/items', itemData);
export const getItems = () => API.get('/items');
export const getLostItems = () => API.get('/items/lost');
export const getFoundItems = () => API.get('/items/found');

export const flagItem = (flagData) => API.post('/flags', flagData);
export const getFlags = () => API.get('/flags');
export const deleteFlag = (id) => API.delete(`/flags/${id}`);

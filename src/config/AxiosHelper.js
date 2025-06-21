import axios from 'axios';

export const baseURL = 'https://chatify-backend-0qps.onrender.com';

export const httpClient = axios.create({
    baseURL: baseURL,
});
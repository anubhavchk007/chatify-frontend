import axios from 'axios';

export const baseURL = 'https://chatify-backend-c5ph.onrender.com';


export const httpClient = axios.create({
    baseURL: baseURL,
});
import axios from 'axios';

// In development, Vite proxy handles /api → localhost:8000
// In production, set VITE_API_URL to your Render backend URL
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_URL,
});

export const getWebSocketURL = (path) => {
    if (API_URL) {
        // Production: connect directly to backend
        const wsProtocol = API_URL.startsWith('https') ? 'wss' : 'ws';
        const host = API_URL.replace(/^https?:\/\//, '');
        return `${wsProtocol}://${host}${path}`;
    }
    // Development: go through Vite proxy
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${path}`;
};

export default api;

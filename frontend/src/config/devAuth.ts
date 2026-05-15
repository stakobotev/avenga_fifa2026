import axios from 'axios';
import type { User } from '../types';

const DEV_MODE = import.meta.env.DEV && !import.meta.env.VITE_AZURE_CLIENT_ID;

export const isDevMode = () => DEV_MODE;

// Create axios instance with credentials for session cookies
const devApi = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

export const devAuthApi = {
    login: async (username: string = 'testuser', admin: boolean = false, region: string = 'OTHER'): Promise<User> => {
        const { data } = await devApi.post('/dev/login', { username, admin: String(admin), region });
        return data;
    },

    getCurrentUser: async (): Promise<User | null> => {
        try {
            const { data } = await devApi.get('/dev/me');
            return data;
        } catch {
            return null;
        }
    },

    logout: async (): Promise<void> => {
        await devApi.post('/dev/logout');
    },
};

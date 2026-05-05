import axios from 'axios';

const API_URL = 'https://interview-1tob.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Mock API responses for development
const mockDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockLogin = async (email, password) => {
    await mockDelay(1000);
    if (email.endsWith('.edu') || email === 'admin@interviewiq.com') { // simplified check
        const isAdmin = email.includes('admin');
        const user = {
            id: isAdmin ? 'admin-1' : 'student-1',
            name: isAdmin ? 'Admin User' : 'Student User',
            email,
            role: isAdmin ? 'admin' : 'student',
        };
        return { token: 'mock-jwt-token', user };
    }
    throw new Error('Invalid email domain. Please use university email.');
};

export const mockSignup = async (data) => {
    await mockDelay(1000);
    if (!data.email.endsWith('.edu')) {
        throw new Error('Invalid email domain. Please use university email.');
    }
    return { token: 'mock-jwt-token', user: { ...data, role: 'student', id: 'student-new' } };
};


export default api;

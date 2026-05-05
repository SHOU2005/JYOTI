import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockLogin, mockSignup } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { user, token } = await mockLogin(email, password);
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            return user;
        } catch (error) {
            throw error;
        }
    };

    const signup = async (data) => {
        try {
            const { user, token } = await mockSignup(data);
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            return user;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const value = {
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading: loading,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

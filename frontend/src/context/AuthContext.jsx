import React, { createContext, useState, useEffect } from 'react';
import api from '../api/config';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Axios interceptor to attach JWT token
    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                if (authTokens) {
                    config.headers['Authorization'] = `Bearer ${authTokens.access}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    logoutUser();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [authTokens]);

    // Decode JWT basic payload if needed or fetch user
    useEffect(() => {
        if (authTokens) {
            api.get('/api/users/')
                .then(res => {
                    setUser({ id: 'active', name: 'User' });
                })
                .catch(() => logoutUser());
        }
        setLoading(false);
    }, [authTokens]);

    const loginUser = async (username, password) => {
        try {
            const response = await api.post('/api/token/', {
                username,
                password
            });

            if (response.data) {
                setAuthTokens(response.data);
                setUser({ username: username }); // Temporarily set simple user data
                localStorage.setItem('authTokens', JSON.stringify(response.data));
                navigate('/');
                return true;
            }
        } catch (error) {
            console.error('Login failed', error);
            return false;
        }
    };

    const registerUser = async (userData) => {
        try {
            const response = await api.post('/api/users/', userData);
            if (response.status === 201) {
                // Auto-login after register
                await loginUser(userData.username, userData.password);
                return true;
            }
        } catch (error) {
            console.error('Registration failed', error);
            return false;
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    };

    const contextData = {
        user,
        authTokens,
        loginUser,
        registerUser,
        logoutUser
    };

    return (
        <AuthContext.Provider value={contextData}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

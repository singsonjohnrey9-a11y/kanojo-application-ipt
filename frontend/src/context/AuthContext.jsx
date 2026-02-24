import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
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
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (authTokens) {
                    config.headers['Authorization'] = `Bearer ${authTokens.access}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Optional: Response interceptor to handle 401s (token expiration)
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    logoutUser();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [authTokens]);

    // Decode JWT basic payload if needed or fetch user
    useEffect(() => {
        if (authTokens) {
            // Fetch current user details
            axios.get('/api/users/')
                .then(res => {
                    // This is a naive way (fetching all users), assuming the backend filters it
                    // The backend should realistically have a /api/users/me/ endpoint, but we can do a quick fix
                    // For now, let's just decode the JWT manually to get user_id (optional) or assume we're logged in
                    setUser({ id: 'active', name: 'User' }); // Placeholder until better endpoint
                })
                .catch(() => logoutUser());
        }
        setLoading(false);
    }, [authTokens]);

    const loginUser = async (username, password) => {
        try {
            const response = await axios.post('/api/token/', {
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
            const response = await axios.post('/api/users/', userData);
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

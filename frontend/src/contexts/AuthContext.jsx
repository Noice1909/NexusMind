import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000';

// Create auth context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));

    // Configure axios interceptor for auth
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (accessToken && config.url?.startsWith(API_BASE_URL)) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If 401 and we have a refresh token, try to refresh
                if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                            refresh_token: refreshToken,
                        });

                        const { access_token, refresh_token: new_refresh_token } = response.data;

                        setAccessToken(access_token);
                        setRefreshToken(new_refresh_token);
                        localStorage.setItem('access_token', access_token);
                        localStorage.setItem('refresh_token', new_refresh_token);

                        originalRequest.headers.Authorization = `Bearer ${access_token}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        logout();
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [accessToken, refreshToken]);

    // Load user on mount if we have a token
    useEffect(() => {
        const loadUser = async () => {
            if (accessToken) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error('Failed to load user:', error);
                    // Token might be invalid, clear it
                    logout();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    // Signup function
    const signup = async (email, password, fullName) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
                email,
                password,
                full_name: fullName,
            });

            const { access_token, refresh_token } = response.data;

            setAccessToken(access_token);
            setRefreshToken(refresh_token);
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            // Load user info
            const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            setUser(userResponse.data);

            toast.success('Account created successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Signup failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });

            const { access_token, refresh_token } = response.data;

            setAccessToken(access_token);
            setRefreshToken(refresh_token);
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            // Load user info
            const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            setUser(userResponse.data);

            toast.success('Logged in successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        signup,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

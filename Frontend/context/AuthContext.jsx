import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Validation on initial load
        const validateToken = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await fetch('http://localhost:5001/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.data);
                        setToken(storedToken);
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error('Auth validation failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        validateToken();
    }, []);

    const login = (userData, newToken) => {
        setUser(userData);
        setToken(newToken);
        localStorage.setItem('token', newToken);
        localStorage.setItem('userRole', userData.role); // For convenience
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        // Clear chat history related items if needed
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager' || user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            loading,
            isAuthenticated,
            isAdmin,
            isManager
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

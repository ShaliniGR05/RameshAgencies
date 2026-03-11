import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    // Merge stored username in case old token doesn't have it
                    const storedUsername = localStorage.getItem('username');
                    setUser({ ...decoded, username: decoded.username || storedUsername });
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (token, username) => {
        localStorage.setItem('token', token);
        if (username) localStorage.setItem('username', username);
        const decoded = jwtDecode(token);
        setUser({ ...decoded, username: decoded.username || username });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

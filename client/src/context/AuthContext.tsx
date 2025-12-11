import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    isGuest: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    loginAsGuest: () => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check if user is already logged in (from localStorage)
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (email: string, _password: string) => {
        // Mock login - in real app, call API
        const mockUser: User = {
            id: 1,
            name: email.split('@')[0],
            email,
            isGuest: false,
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
    };

    const signup = async (name: string, email: string, _password: string) => {
        // Mock signup - in real app, call API
        const mockUser: User = {
            id: Date.now(),
            name,
            email,
            isGuest: false,
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
    };

    const loginAsGuest = () => {
        const guestUser: User = {
            id: 0,
            name: 'Guest',
            email: 'guest@buskaro.com',
            isGuest: true,
        };
        setUser(guestUser);
        localStorage.setItem('user', JSON.stringify(guestUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                signup,
                loginAsGuest,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

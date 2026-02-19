import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('isLoggedIn') === 'true';
    });

    const login = async (email: string, password: string) => {
        // Mock authentication logic
        console.log("Mock login for:", email);
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setIsAuthenticated(true);
                localStorage.setItem('isLoggedIn', 'true');
                resolve();
            }, 800);
        });
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isLoggedIn');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

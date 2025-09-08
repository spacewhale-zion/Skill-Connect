// src/context/AuthContext.tsx
import  { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser } from '../services/authServices';
import { AuthUser, UserCredentials, UserRegistrationData } from '../types';
import api from '../api/axiosConfig';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: UserCredentials) => Promise<void>;
  register: (userData: UserRegistrationData) => Promise<void>;
  logout: () => void;
  updateUser: (newUserData: Partial<AuthUser>) => void; // For profile updates
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData: AuthUser = JSON.parse(storedUser);
      setUser(userData);
    }
    console.log(storedUser)
    // Set loading to false after attempting to load user
    setIsLoading(false);
  }, []);

  const handleAuth = async (authPromise: Promise<AuthUser>) => {
    const userData = await authPromise;
    localStorage.setItem('user', JSON.stringify(userData));
    // The axios interceptor will handle setting the header from now on
    setUser(userData);
  };

  const updateUser = (newUserData: Partial<AuthUser>) => {
    // Use the functional form of setState to get the most recent state
    setUser(currentUser => {
      // If for some reason there's no user, do nothing.
      if (!currentUser) return null;

      // Create the new user object by merging old data with new data
      const updatedUser = { ...currentUser, ...newUserData };

      // Update localStorage with the fully merged object
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Return the new state
      return updatedUser;
    });
  };

  const login = async (credentials: UserCredentials) => {
    await handleAuth(loginUser(credentials));
  };

  const register = async (userData: UserRegistrationData) => {
    await handleAuth(registerUser(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // The axios interceptor will see no user and won't add the header
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
      {/* We render children even while loading to prevent flashes of unstyled content */}
      {children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
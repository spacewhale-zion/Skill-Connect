// src/context/authContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, getMyProfile } from '@/services/authServices'; // Keep getMyProfile
import { AuthUser, UserCredentials, UserRegistrationData } from '@/types';
// Remove registerUser from direct context usage if verifyEmail handles the final login

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: UserCredentials) => Promise<void>;
  register: (userData: UserRegistrationData) => Promise<{ message: string, email: string }>;
  logout: () => void;
  updateUser: (newUserData: Partial<AuthUser>) => void;
  isLoading: boolean;
  loginAfterVerification: (userData: AuthUser) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
      const loadUser = async () => {
          const storedUserString = localStorage.getItem('user');
          if (storedUserString) {
              try {
                  const freshUser = await getMyProfile();
                  if (!freshUser.isEmailVerified) {
                       console.warn("User loaded but email not verified. Logging out.");
                       logout();
                       setIsLoading(false);
                       return;
                  }
                  setUser(freshUser);
                  localStorage.setItem('user', JSON.stringify(freshUser));
              } catch (error) {
                  console.error("Session invalid, logging out.", error);
                  logout();
              }
          }
          setIsLoading(false);
      };
      loadUser();
  }, []);


  const setUserAndStorage = (userData: AuthUser | null) => {
      setUser(userData);
      if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
      } else {
          localStorage.removeItem('user');
      }
  };

  const login = async (credentials: UserCredentials) => {
      const userData = await loginUser(credentials);
      setUserAndStorage(userData);
  };

  const register = async (userData: UserRegistrationData): Promise<{ message: string, email: string }> => {
      return await registerUser(userData);
  };

  const loginAfterVerification = (userData: AuthUser) => {
      setUserAndStorage(userData);
  };


  const logout = () => {
      setUserAndStorage(null);
  };

  const updateUser = (newUserData: Partial<AuthUser>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const updatedUser = { ...currentUser, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading, loginAfterVerification,isAdmin }}>
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
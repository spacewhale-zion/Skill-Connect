// src/context/authContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, getMyProfile } from '@/services/authServices'; // Keep getMyProfile
import { AuthUser, UserCredentials, UserRegistrationData } from '@/types';
// Remove registerUser from direct context usage if verifyEmail handles the final login

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: UserCredentials) => Promise<void>;
  // register function might just initiate now, not log in
  register: (userData: UserRegistrationData) => Promise<{ message: string, email: string }>;
  logout: () => void;
  updateUser: (newUserData: Partial<AuthUser>) => void;
  isLoading: boolean;
  // Add a function to handle login after successful verification
  loginAfterVerification: (userData: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const loadUser = async () => {
          const storedUserString = localStorage.getItem('user');
          if (storedUserString) {
              try {
                  // Check token validity by fetching profile
                  const freshUser = await getMyProfile();
                   // Check if the user loaded from storage/API is actually verified
                  if (!freshUser.isEmailVerified) {
                       console.warn("User loaded but email not verified. Logging out.");
                       logout(); // Log out if email isn't verified
                       setIsLoading(false);
                       return;
                  }
                  setUser(freshUser);
                  // Update storage only if fetched data differs significantly or on login/update
                  localStorage.setItem('user', JSON.stringify(freshUser));
              } catch (error) {
                  console.error("Session invalid, logging out.", error);
                  logout(); // Token likely invalid/expired
              }
          }
          setIsLoading(false);
      };
      loadUser();
  }, []); // Empty dependency array means this runs once on mount


  // Helper to set user state and localStorage
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
      // Login service already checks for verification on the backend
      setUserAndStorage(userData);
  };

  // Register now just calls the service, doesn't set user state
  const register = async (userData: UserRegistrationData): Promise<{ message: string, email: string }> => {
      // It doesn't log the user in, just starts the process
      return await registerUser(userData);
  };

  // New function called by VerifyEmailPage after successful code submission
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
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading, loginAfterVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook remains the same
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
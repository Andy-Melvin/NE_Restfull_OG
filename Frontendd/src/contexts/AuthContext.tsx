import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthUser, LoginFormData, SignUpFormData } from '../types/auth';
import { toast } from "@/components/ui/sonner";
import authService from '../services/api/auth';

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser({
            ...userData,
            role: userData.role // Keep the role as is from the backend
          });
        }
      } catch (err) {
        console.error('Failed to get current user:', err);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Sign up function
  const signUp = async (data: SignUpFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.signup(data);
      setUser({
        ...response.user,
        role: response.user.role // Keep the role as is from the backend
      });
      localStorage.setItem('token', response.token);
      toast.success("Account created successfully!");
    } catch (err: any) {
      let message = 'Failed to create account. Please try again.';
      if (err.response) {
        message = err.response.data?.message || JSON.stringify(err.response.data);
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      toast.error(message);
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (data: LoginFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(data);
      setUser({
        ...response.user,
        role: response.user.role // Keep the role as is from the backend
      });
      localStorage.setItem('token', response.token);
      toast.success("Logged in successfully!");
    } catch (err: any) {
      let message = 'Invalid email or password';
      if (err.response) {
        message = err.response.data?.message || JSON.stringify(err.response.data);
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      toast.error(message);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('token');
      toast.success("Logged out successfully");
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local state even if API call fails
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  // Context provider value
  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    signUp,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

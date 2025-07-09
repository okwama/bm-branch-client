import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  client_id: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🔐 AuthProvider: Initializing...');
  
  const [user, setUser] = useState<User | null>(() => {
    console.log('🔐 AuthProvider: Setting initial user state...');
    try {
      const savedUser = localStorage.getItem('user');
      console.log('🔐 AuthProvider: Found saved user in localStorage:', savedUser ? 'YES' : 'NO');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('🔐 AuthProvider: Parsed user data:', parsedUser);
        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error('🔐 AuthProvider: Error parsing saved user:', error);
      localStorage.removeItem('user');
      return null;
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  console.log('🔐 AuthProvider: Initial state - user:', user, 'isLoading:', isLoading);

  useEffect(() => {
    console.log('🔐 AuthProvider: useEffect triggered - checking localStorage...');
    // Check if user is logged in from localStorage on mount
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        console.log('🔐 AuthProvider: localStorage check - storedUser:', storedUser ? 'EXISTS' : 'NOT FOUND');
        console.log('🔐 AuthProvider: localStorage check - token:', token ? 'EXISTS' : 'NOT FOUND');
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔐 AuthProvider: Restoring user from localStorage:', parsedUser);
          setUser(parsedUser);
          console.log('🔐 AuthProvider: User restored successfully');
        } else {
          console.log('🔐 AuthProvider: No stored authentication found - user will remain null');
        }
      } catch (error) {
        console.error('🔐 AuthProvider: Error initializing auth:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        console.log('🔐 AuthProvider: Setting isLoading to false');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: User) => {
    console.log('🔐 AuthProvider: login() called with token:', token ? 'EXISTS' : 'MISSING');
    console.log('🔐 AuthProvider: login() called with userData:', userData);
    
    try {
      console.log('🔐 AuthProvider: Storing token in localStorage...');
      localStorage.setItem('token', token);
      console.log('🔐 AuthProvider: Storing user in localStorage...');
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('🔐 AuthProvider: Updating user state...');
      setUser(userData);
      console.log('🔐 AuthProvider: Login successful - user state updated');
    } catch (error) {
      console.error('🔐 AuthProvider: Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🔐 AuthProvider: logout() called');
    try {
      console.log('🔐 AuthProvider: Removing token from localStorage...');
      localStorage.removeItem('token');
      console.log('🔐 AuthProvider: Removing user from localStorage...');
      localStorage.removeItem('user');
      console.log('🔐 AuthProvider: Setting user state to null...');
      setUser(null);
      console.log('🔐 AuthProvider: Logout successful');
    } catch (error) {
      console.error('🔐 AuthProvider: Error during logout:', error);
    }
  };

  const isAuthenticated = !!user;
  console.log('🔐 AuthProvider: Current state - user:', user, 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  console.log('🔐 useAuth: Hook called');
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('🔐 useAuth: Hook used outside AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  console.log('🔐 useAuth: Returning context:', {
    user: context.user ? 'EXISTS' : 'NULL',
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading
  });
  return context;
}; 
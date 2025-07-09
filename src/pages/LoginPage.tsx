import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import axios from 'axios';
import { terminalLogger } from '../services/terminalLogger';

const LoginPage: React.FC = () => {
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        setError('');
      }, 5000);

      // Cleanup timeout if error changes or component unmounts
      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  // Log component mount and location state once
  useEffect(() => {
    terminalLogger.info('LoginPage', 'Component mounted');
    terminalLogger.info('LoginPage', 'Location state', location.state);
  }, []);

  // Log state changes only when they actually change (not on every render)
  useEffect(() => {
    terminalLogger.info('LoginPage', 'State changed', { 
      username: username ? 'SET' : 'EMPTY', 
      error, 
      isLoading 
    });
  }, [username, error, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    terminalLogger.info('LoginPage', 'handleSubmit called', { eventType: e.type });
    e.preventDefault();
    terminalLogger.info('LoginPage', 'Form submitted - preventDefault called');
    terminalLogger.info('LoginPage', 'Form data', { 
      username, 
      password: password ? 'SET' : 'EMPTY' 
    });
    
    // Simple validation
    if (!username || !password) {
      terminalLogger.warn('LoginPage', 'Validation failed - missing username or password');
      setError('Please enter both username and password');
      return;
    }
    
    setError('');
    setIsLoading(true);
    terminalLogger.info('LoginPage', 'Set loading state to true');

    try {
      terminalLogger.info('LoginPage', 'Starting login process...');
      terminalLogger.info('LoginPage', 'API base URL', { url: import.meta.env.VITE_API_URL });
      terminalLogger.info('LoginPage', 'Making API call to /auth/login...');
      
      const response = await api.post('/auth/login', { username, password });
      terminalLogger.info('LoginPage', 'API response received');
      terminalLogger.info('LoginPage', 'Response status', { status: response.status });
      terminalLogger.info('LoginPage', 'Response data', response.data);
      terminalLogger.info('LoginPage', 'Response validation', { 
        hasToken: !!response.data.token, 
        hasUser: !!response.data.user 
      });

      if (response.data.token && response.data.user) {
        terminalLogger.info('LoginPage', 'Valid response received, calling login function...');
        terminalLogger.info('LoginPage', 'Token received', { 
          tokenPreview: response.data.token.substring(0, 20) + '...' 
        });
        terminalLogger.info('LoginPage', 'User data', response.data.user);
        
        login(response.data.token, response.data.user);
        terminalLogger.info('LoginPage', 'Login function called successfully');
        
        // Get the intended destination or default to dashboard
        const from = (location.state as any)?.from?.pathname || '/';
        terminalLogger.info('LoginPage', 'Navigation details', { 
          redirectDestination: from,
          locationState: location.state 
        });
        
        // Use setTimeout to ensure state updates are processed
        terminalLogger.info('LoginPage', 'Scheduling navigation in 100ms...');
        setTimeout(() => {
          terminalLogger.info('LoginPage', 'Executing navigation', { destination: from });
          navigate(from, { replace: true });
        }, 100);
      } else {
        terminalLogger.error('LoginPage', 'Invalid response - missing token or user data');
        terminalLogger.error('LoginPage', 'Response structure', {
          hasToken: !!response.data.token,
          hasUser: !!response.data.user,
          tokenType: typeof response.data.token,
          userType: typeof response.data.user
        });
        setError('Invalid response from server');
      }
    } catch (error: any) {
      terminalLogger.error('LoginPage', 'Login error occurred', error);
      
      // Handle custom API errors (from our API interceptor)
      if (error.status && error.response) {
        terminalLogger.error('LoginPage', 'API error details', {
          status: error.status,
          message: error.message,
          details: error.details
        });
        
        if (error.status === 401) {
          terminalLogger.warn('LoginPage', '401 Unauthorized - invalid credentials');
          setError(error.details?.message || 'Invalid username or password');
        } else if (error.status === 404) {
          setError('Service not found. Please contact support.');
        } else if (error.status === 500) {
          setError('Server error. Please try again later.');
        } else if (error.details?.message) {
          setError(error.details.message);
        } else {
          setError('Login failed. Please try again.');
        }
      } 
      // Handle regular Axios errors (fallback)
      else if (axios.isAxiosError(error)) {
        terminalLogger.error('LoginPage', 'Axios error details', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 401) {
          setError('Invalid username or password');
        } else if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else if (!error.response) {
          setError('Cannot connect to server. Please check your connection.');
        } else {
          setError('Login failed. Please try again.');
        }
      } 
      // Handle timeout errors
      else if (error.code === 'timeout') {
        terminalLogger.error('LoginPage', 'Request timeout');
        setError('Request timed out. Please check your connection and try again.');
      }
      // Handle network errors
      else if (error.code === 'network') {
        terminalLogger.error('LoginPage', 'Network error');
        setError('Network error. Please check your connection.');
      }
      // Handle any other error
      else {
        terminalLogger.error('LoginPage', 'Unknown error type', error);
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      terminalLogger.info('LoginPage', 'Setting loading state to false');
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    terminalLogger.debug('LoginPage', 'Username changed', { username: value });
    setUsername(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    terminalLogger.debug('LoginPage', 'Password changed', { passwordLength: value.length });
    setPassword(value);
  };


  return (
    <div 
      className="min-h-screen bg-gray-50 flex flex-col justify-center"
      onClick={() => terminalLogger.debug('LoginPage', 'Main container clicked')}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center">
            <img 
              src="/bm.jpeg" 
              alt="SWISS LIFE" 
              className="h-50 object-contain"
            />
          </div>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form 
              className="space-y-6" 
              onSubmit={handleSubmit}
            >
              {error && (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={handleUsernameChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-red-600 hover:text-red-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
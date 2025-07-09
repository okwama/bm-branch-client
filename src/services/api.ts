import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig
} from 'axios';

// Enhanced type definitions
export type RequestConfig<T = any> = AxiosRequestConfig<T>;
export type Response<T = any, D = any> = AxiosResponse<T, D>;
export type ApiResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
};

export interface ApiError extends Error {
  status: number;
  message: string;
  details?: any;
  code?: string;
  response?: any;
  config?: any;
  isAxiosError?: boolean;
  toJSON?: () => object;
  
  // Allow any other properties since we're extending Error
  [key: string]: any;
}

// Validate and get API base URL
const getApiBaseUrl = (): string => {
  console.log('🌐 API: Getting base URL...');
  const url = import.meta.env.VITE_API_URL;
  console.log('🌐 API: Environment variables:', import.meta.env);
  console.log('🌐 API: VITE_API_URL:', url);
  if (!url) {
    console.warn('🌐 API: VITE_API_URL is not defined, using production server');
    return 'https://bm-branch-server.vercel.app/api';
  }
  const finalUrl = url.endsWith('/api') ? url : `${url}/api`;
  console.log('🌐 API: Final base URL:', finalUrl);
  return finalUrl;
};

const API_BASE_URL = getApiBaseUrl();
console.log('🌐 API: Using API base URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // Increased from 10s to 30s
  withCredentials: true
});

console.log('🌐 API: Axios instance created with config:', {
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true
});

// Single request interceptor for authentication and debugging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('🌐 API: Request interceptor triggered');
    console.log('🌐 API: Request URL:', config.url);
    console.log('🌐 API: Request method:', config.method);
    console.log('🌐 API: Request baseURL:', config.baseURL);
    
    // Add authentication token
    const token = localStorage.getItem('token');
    console.log('🌐 API: Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND');
    
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🌐 API: Added auth token to request:', {
        token: token.substring(0, 10) + '...',
        headerSet: !!config.headers.Authorization
      });
    } else {
      console.warn('🌐 API: No auth token found in localStorage');
    }

    // Log request details
    console.log('🌐 API: Full request details:', {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data
    });

    return config;
  },
  (error: AxiosError) => {
    console.error('🌐 API: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Single response interceptor for handling errors and debugging
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse<any> => {
    console.log('🌐 API: Response interceptor triggered');
    console.log('🌐 API: Response status:', response.status);
    console.log('🌐 API: Response statusText:', response.statusText);
    console.log('🌐 API: Response URL:', response.config.url);
    console.log('🌐 API: Response data:', response.data);
    return response;
  },
  async (error: unknown): Promise<never> => {
    console.error('🌐 API: Response interceptor error:', error);
    if (axios.isAxiosError(error)) {
      console.error('🌐 API: Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
      
      if (error.code === 'ECONNABORTED') {
        console.log('🌐 API: Request timeout error');
        const timeoutError = new Error('Request timed out. Please check your connection and try again.') as ApiError;
        timeoutError.status = 408;
        timeoutError.code = 'timeout';
        (timeoutError as any).details = error.config;
        throw timeoutError;
      }

      if (!error.response) {
        console.log('🌐 API: Network error - no response received');
        const networkError = new Error('Cannot connect to server. Please check your internet connection.') as ApiError;
        networkError.status = 0;
        networkError.code = 'network';
        throw networkError;
      }

      const { status, data } = error.response;
      console.log('🌐 API: Processing error response - status:', status);
      
      switch (status) {
        case 401:
          console.log('🌐 API: 401 Unauthorized - clearing token and redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.log('🌐 API: 403 Forbidden');
          break;
        case 404:
          console.log('🌐 API: 404 Not Found');
          break;
        case 500:
          console.log('🌐 API: 500 Internal Server Error');
          break;
        default:
          console.log('🌐 API: Other error status:', status);
      }

      // Create user-friendly error messages
      let userMessage = 'An error occurred';
      if (typeof data === 'object' && data !== null && 'message' in data) {
        userMessage = (data as { message: string }).message;
      } else {
        switch (status) {
          case 400:
            userMessage = 'Invalid request. Please check your input and try again.';
            break;
          case 401:
            userMessage = 'Invalid credentials. Please check your login details.';
            break;
          case 403:
            userMessage = 'Access denied. You do not have permission to perform this action.';
            break;
          case 404:
            userMessage = 'The requested resource was not found.';
            break;
          case 408:
            userMessage = 'Request timed out. Please try again.';
            break;
          case 409:
            userMessage = 'Conflict detected. The resource may have been modified by another user.';
            break;
          case 422:
            userMessage = 'Invalid data provided. Please check your input.';
            break;
          case 429:
            userMessage = 'Too many requests. Please wait a moment before trying again.';
            break;
          case 500:
            userMessage = 'Server error. Please try again later.';
            break;
          case 502:
          case 503:
          case 504:
            userMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            userMessage = `An error occurred (${status}). Please try again.`;
        }
      }

      const errorData = new Error(userMessage) as ApiError;
      
      errorData.status = status;
      errorData.code = `http-${status}`;
      (errorData as any).response = error.response;
      
      if (typeof data === 'object' && data !== null) {
        (errorData as any).details = data;
      }
      
      throw errorData;
    }

    const unknownError = new Error(
      error instanceof Error ? error.message : 'An unknown error occurred'
    ) as ApiError;
    unknownError.status = 500;
    unknownError.code = 'unknown';
    
    if (error instanceof Error) {
      unknownError.stack = error.stack;
    }
    
    throw unknownError;
  }
);

// Enhanced utility functions with better typing
export const get = async <T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
  console.log('🌐 API: GET request to:', url);
  const response = await api.get<T>(url, config);
  return {
    data: response.data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  };
};

export const post = async <T, D = any>(url: string, data?: D, config?: RequestConfig<D>): Promise<ApiResponse<T>> => {
  console.log('🌐 API: POST request to:', url);
  console.log('🌐 API: POST data:', data);
  const response = await api.post<T>(url, data, config);
  return {
    data: response.data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  };
};

export const put = async <T, D = any>(url: string, data?: D, config?: RequestConfig<D>): Promise<ApiResponse<T>> => {
  console.log('🌐 API: PUT request to:', url);
  const response = await api.put<T>(url, data, config);
  return response;
};

export const patch = async <T, D = any>(url: string, data?: D, config?: RequestConfig<D>): Promise<ApiResponse<T>> => {
  console.log('🌐 API: PATCH request to:', url);
  const response = await api.patch<T>(url, data, config);
  return response;
};

export const del = async <T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
  console.log('🌐 API: DELETE request to:', url);
  const response = await api.delete<T>(url, config);
  return response;
};

export const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del,
};

export default api;
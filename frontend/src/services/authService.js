import axios from 'axios';

// Multiple port fallback system for development
const DEVELOPMENT_PORTS = [5001, 5000, 5002, 5003, 8000, 8001, 3001];
let discoveredApiUrl = null;

// Discover available backend port
const discoverBackendPort = async () => {
  if (process.env.NODE_ENV === 'production') {
    return ''; // Use relative URLs in production
  }

  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (discoveredApiUrl) {
    return discoveredApiUrl; // Use cached result
  }

  console.log('🔍 Discovering backend port...');
  
  for (const port of DEVELOPMENT_PORTS) {
    const testUrl = `http://localhost:${port}`;
    try {
      console.log(`  🧪 Testing port ${port}...`);
      const response = await axios.get(`${testUrl}/api/health`, { 
        timeout: 2000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 200) {
        console.log(`  ✅ Found backend on port ${port}`);
        discoveredApiUrl = testUrl;
        return testUrl;
      }
    } catch (error) {
      console.log(`  ❌ Port ${port} not available`);
      // Continue to next port
    }
  }
  
  console.warn('⚠️ No backend found on any port, falling back to port 5001');
  discoveredApiUrl = 'http://localhost:5001';
  return discoveredApiUrl;
};

// Initialize API configuration
let api;
const initializeApi = async () => {
  const API_BASE_URL = await discoverBackendPort();
  const fullApiUrl = `${API_BASE_URL}/api`;
  
  console.log('🔧 API Configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    discoveredPorts: DEVELOPMENT_PORTS,
    API_BASE_URL,
    fullApiUrl
  });

  api = axios.create({
    baseURL: fullApiUrl,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
  });
  
  return api;
};

// Get or initialize API instance
const getApi = async () => {
  if (!api) {
    await initializeApi();
    
    // Add interceptors after API is initialized
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
  return api;
};

export const authService = {
  // Health check - useful for debugging
  async healthCheck() {
    try {
      const apiInstance = await getApi();
      const response = await apiInstance.get('/health');
      console.log('✅ Health check successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  },
  // Register new user
  async register(userData) {
    try {
      const apiInstance = await getApi();
      const response = await apiInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(credentials) {
    try {
      const apiInstance = await getApi();
      const response = await apiInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      const apiInstance = await getApi();
      const response = await apiInstance.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const apiInstance = await getApi();
      const response = await apiInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Verify token
  async verifyToken() {
    try {
      const apiInstance = await getApi();
      const response = await apiInstance.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const apiInstance = await getApi();
      const response = await apiInstance.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const apiInstance = await getApi();
      const response = await apiInstance.put('/auth/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Search users
  async searchUsers(query, limit = 10) {
    try {
      const apiInstance = await getApi();
      const response = await apiInstance.get(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  },

  // Get online users
  async getOnlineUsers() {
    try {
      const apiInstance = await getApi();
      const response = await apiInstance.get('/users/online');
      return response.data;
    } catch (error) {
      console.error('Get online users error:', error);
      throw error;
    }
  }
};

// Export the configured axios instance for use in other services
export { getApi as api };

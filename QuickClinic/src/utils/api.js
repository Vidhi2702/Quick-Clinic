class APIClient {
  constructor(baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Set authentication tokens
  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Clear authentication tokens
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Get stored user data
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Store user data
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      if (data.success) {
        this.token = data.data.accessToken;
        localStorage.setItem('accessToken', this.token);
        return this.token;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      // Redirect to login or emit event for app to handle
      window.dispatchEvent(new CustomEvent('auth:tokenExpired'));
      throw error;
    }
  }

  // Make authenticated API request with automatic token refresh
  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (this.token) {
      defaultHeaders.Authorization = `Bearer ${this.token}`;
    }

    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      let response = await fetch(fullUrl, requestOptions);

      // If token expired, try to refresh and retry
      if (response.status === 401 && this.refreshToken) {
        const responseData = await response.json();
        
        if (responseData.code === 'TOKEN_EXPIRED') {
          try {
            await this.refreshAccessToken();
            // Retry request with new token
            requestOptions.headers.Authorization = `Bearer ${this.token}`;
            response = await fetch(fullUrl, requestOptions);
          } catch (refreshError) {
            throw new Error('Authentication failed');
          }
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(data.message || 'Request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(error.message || 'Network error', 0);
    }
  }

  // HTTP method helpers
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async put(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async patch(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  // File upload helper
  async uploadFile(url, file, fieldName = 'file', additionalData = {}) {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Add additional data to form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return this.request(url, {
      method: 'POST',
      headers,
      body: formData,
    });
  }
}

// Custom API Error class
class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Create and export API client instance
const apiClient = new APIClient();

// Auth-specific API methods
export const authAPI = {
  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.success) {
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
      apiClient.setUser(response.data.user);
    }
    return response;
  },

  // Register user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.success) {
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
      apiClient.setUser(response.data.user);
    }
    return response;
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      apiClient.clearTokens();
    }
  },

  // Get user profile
  getProfile: async () => {
    return apiClient.get('/auth/profile');
  },

  // Change password
  changePassword: async (passwordData) => {
    return apiClient.post('/auth/change-password', passwordData);
  },

  // Check if user is authenticated
  isAuthenticated: () => apiClient.isAuthenticated(),

  // Get current user
  getCurrentUser: () => apiClient.getUser(),
};

// Hospital API methods
export const hospitalAPI = {
  getAll: () => apiClient.get('/hospitals'),
  getById: (id) => apiClient.get(`/hospitals/${id}`),
  create: (data) => apiClient.post('/hospitals', data),
  update: (id, data) => apiClient.put(`/hospitals/${id}`, data),
  delete: (id) => apiClient.delete(`/hospitals/${id}`),
};

// Appointment API methods
export const appointmentAPI = {
  getAll: () => apiClient.get('/appointments'),
  getById: (id) => apiClient.get(`/appointments/${id}`),
  create: (data) => apiClient.post('/appointments', data),
  update: (id, data) => apiClient.put(`/appointments/${id}`, data),
  cancel: (id) => apiClient.patch(`/appointments/${id}/cancel`),
  getByPatient: (patientId) => apiClient.get(`/appointments/patient/${patientId}`),
  getByDoctor: (doctorId) => apiClient.get(`/appointments/doctor/${doctorId}`),
};

// Doctor API methods
export const doctorAPI = {
  getAll: () => apiClient.get('/doctors'),
  getById: (id) => apiClient.get(`/doctors/${id}`),
  getBySpecialization: (specialization) => apiClient.get(`/doctors/specialization/${specialization}`),
  getByHospital: (hospitalId) => apiClient.get(`/doctors/hospital/${hospitalId}`),
  getAvailability: (doctorId, hospitalId) => apiClient.get(`/doctors/${doctorId}/availability/${hospitalId}`),
};

// Default export
export default apiClient;

// Export error class
export { APIError };    
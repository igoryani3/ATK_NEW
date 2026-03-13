import axios from 'axios';

// API Configuration
// In development: use direct backend URL
// In production: use relative URL with subpath (proxied by Nginx)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? '/projects/ATK/api'  // Production: relative URL with subpath
    : 'http://localhost:5555/api');  // Development: direct to backend

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error - No response:', {
        url: error.config?.url,
        message: error.message
      });
    } else {
      // Error setting up request
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  logout: () => api.post('/auth/logout'),

  checkAuth: () => api.get('/auth/check'),
};

// Trips API
export const tripsAPI = {
  getAll: () => api.get('/trips'),

  getById: (id: number) => api.get(`/trips/${id}`),

  getByDate: (date: string) => api.get(`/trips/by-date/${date}`),

  getMonthSummary: (month: string) => api.get(`/trips/month-summary/${month}`),

  create: (tripData: any) => api.post('/trips', tripData),

  update: (id: number, tripData: any) => api.put(`/trips/${id}`, tripData),

  delete: (id: number) => api.delete(`/trips/${id}`),
};

// Reference data APIs
export const driversAPI = {
  getAll: () => api.get('/drivers'),
  getById: (id: number) => api.get(`/drivers/${id}`),
  create: (data: any) => api.post('/drivers', data),
  update: (id: number, data: any) => api.put(`/drivers/${id}`, data),
  delete: (id: number) => api.delete(`/drivers/${id}`),
};

export const vehiclesAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id: number) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: number, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};

export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id: number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

export const regionsAPI = {
  getAll: () => api.get('/regions'),
  getById: (id: number) => api.get(`/regions/${id}`),
  create: (data: any) => api.post('/regions', data),
  update: (id: number, data: any) => api.put(`/regions/${id}`, data),
  delete: (id: number) => api.delete(`/regions/${id}`),
};

export const tripTypesAPI = {
  getAll: () => api.get('/trip-types'),
  getById: (id: number) => api.get(`/trip-types/${id}`),
  create: (data: any) => api.post('/trip-types', data),
  update: (id: number, data: any) => api.put(`/trip-types/${id}`, data),
  delete: (id: number) => api.delete(`/trip-types/${id}`),
};

export const contractsAPI = {
  getAll: () => api.get('/contracts'),
  getById: (id: number) => api.get(`/contracts/${id}`),
  create: (data: any) => api.post('/contracts', data),
  update: (id: number, data: any) => api.put(`/contracts/${id}`, data),
  delete: (id: number) => api.delete(`/contracts/${id}`),
};

export const executorsAPI = {
  getAll: () => api.get('/executors'),
  getById: (id: number) => api.get(`/executors/${id}`),
  getDrivers: (id: number) => api.get(`/executors/${id}/drivers`),
  getVehicles: (id: number) => api.get(`/executors/${id}/vehicles`),
  create: (data: any) => api.post('/executors', data),
  update: (id: number, data: any) => api.put(`/executors/${id}`, data),
  delete: (id: number) => api.delete(`/executors/${id}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Route Templates API
export const routeTemplatesAPI = {
  getAll: () => api.get('/route-templates'),
  getById: (id: number) => api.get(`/route-templates/${id}`),
  create: (data: any) => api.post('/route-templates', data),
  update: (id: number, data: any) => api.put(`/route-templates/${id}`, data),
  delete: (id: number) => api.delete(`/route-templates/${id}`),
  generateTrips: (id: number) => api.post(`/route-templates/${id}/generate-trips`),
};

// Reports API
export const reportsAPI = {
  weeklyPreview: (params: { start: string; end: string; plate?: string }) =>
    api.get('/reports/weekly-preview', { params }),

  weeklyExcel: (params: { start: string; end: string; plate?: string }) =>
    api.get('/reports/weekly-excel', {
      params,
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' },
    }),
};

// Sync API
export const syncAPI = {
  tripsToSheets: (payload: { start: string; end: string }) =>
    api.post('/sync/trips-to-sheets', payload),
};

export default api;

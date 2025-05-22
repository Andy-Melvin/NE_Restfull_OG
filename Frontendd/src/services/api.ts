import axios from "axios";
import { 
  Parking, 
  CreateParkingRequest,
  CarParkingRecord,
  CarEntryRequest,
  CarExitRequest,
  ReportQuery,
  ParkingUtilization,
  ParkingStatistics,
  ParkingUtilizationReport,
  LogEntry 
} from "@/types/parking";

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to include JWT in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
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

// Authentication APIs
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// Parking Management APIs
export const parkingApi = {
  getAllParkings: async (): Promise<{ data: Parking[] }> => {
    const response = await api.get('/parking');
    return response.data;
  },
  
  getParking: async (id: string): Promise<{ data: Parking }> => {
    const response = await api.get(`/parking/${id}`);
    return response.data;
  },
  
  createParking: async (parking: CreateParkingRequest): Promise<{ data: Parking }> => {
    const response = await api.post('/parking', {
      code: parking.code,
      name: parking.name,
      location: parking.location,
      numberOfSpaces: parking.numberOfSpaces,
      chargingFeePerHour: parking.chargingFeePerHour
    });
    return response.data;
  },
  
  updateParking: async (id: string, parking: CreateParkingRequest): Promise<{ data: Parking }> => {
    const response = await api.put(`/parking/${id}`, {
      code: parking.code,
      name: parking.name,
      location: parking.location,
      numberOfSpaces: parking.numberOfSpaces,
      chargingFeePerHour: parking.chargingFeePerHour
    });
    return response.data;
  },
  
  deleteParking: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/parking/${id}`);
    return response.data;
  },

  getParkingStats: async (): Promise<{ data: ParkingStatistics[] }> => {
    const response = await api.get('/parking/stats/overview');
    return response.data;
  },

  getParkingUtilization: async (): Promise<{ data: ParkingUtilization[] }> => {
    const response = await api.get('/parking/stats/utilization');
    return response.data;
  }
};

// Car Management APIs
export const carApi = {
  registerEntry: async (data: CarEntryRequest): Promise<{ message: string, data: CarParkingRecord }> => {
    try {
      const response = await api.post('/cars/entry', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already entered')) {
        throw new Error('This car has already entered the parking. Please check the plate number.');
      }
      throw error;
    }
  },
  
  registerExit: async (data: CarExitRequest): Promise<{ message: string, data: any }> => {
    const response = await api.post('/cars/exit', data);
    return response.data;
  },
  
  getActiveParkings: async (): Promise<{ data: CarParkingRecord[] }> => {
    const response = await api.get('/cars/active');
    return response.data;
  }
};

// Reports APIs
export const reportApi = {
  getEntryReport: async (query: ReportQuery) => {
    const response = await api.get('/reports/entered', { params: query });
    return response;
  },
  
  getExitReport: async (query: ReportQuery) => {
    const response = await api.get('/reports/outgoing', { params: query });
    return response;
  },
  
  getUtilizationReport: async (query: ReportQuery) => {
    const response = await api.get('/reports/utilization', { params: query });
    return response;
  }
};

// Logs API
export const logsApi = {
  getLogs: async (params: { 
    page?: number; 
    limit?: number; 
    level?: string; 
    search?: string;
  }): Promise<{ 
    data: LogEntry[]; 
    total: number; 
    page: number; 
    limit: number;
  }> => {
    const response = await api.get('/logs', { params });
    return response.data;
  }
};

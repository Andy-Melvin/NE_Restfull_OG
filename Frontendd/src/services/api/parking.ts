import api from './config';

export interface Parking {
  id: string;
  code: string;
  name: string;
  location: string;
  availableSpaces: number;
  hourlyRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParkingInput {
  code: string;
  name: string;
  location: string;
  availableSpaces: number;
  hourlyRate: number;
}

export interface ParkingStats {
  totalParkings: number;
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  utilizationRate: number;
}

export interface ParkingUtilization {
  parkingId: string;
  parkingName: string;
  totalSpaces: number;
  occupiedSpaces: number;
  utilizationRate: number;
}

const parkingService = {
  // Public endpoints
  async listParkings(): Promise<Parking[]> {
    const response = await api.get<Parking[]>('/parking');
    return response.data;
  },

  async getParking(id: string): Promise<Parking> {
    const response = await api.get<Parking>(`/parking/${id}`);
    return response.data;
  },

  // Admin only endpoints
  async createParking(data: CreateParkingInput): Promise<Parking> {
    const response = await api.post<Parking>('/parking', data);
    return response.data;
  },

  async updateParking(id: string, data: CreateParkingInput): Promise<Parking> {
    const response = await api.put<Parking>(`/parking/${id}`, data);
    return response.data;
  },

  async deleteParking(id: string): Promise<void> {
    await api.delete(`/parking/${id}`);
  },

  async getParkingStats(): Promise<ParkingStats> {
    const response = await api.get<ParkingStats>('/parking/stats/overview');
    return response.data;
  },

  async getParkingUtilization(): Promise<ParkingUtilization[]> {
    const response = await api.get<ParkingUtilization[]>('/parking/stats/utilization');
    return response.data;
  }
};

export default parkingService; 
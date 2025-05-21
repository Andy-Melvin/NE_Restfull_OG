import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";
import parkingService, { Parking, CreateParkingInput, ParkingStats, ParkingUtilization } from '../services/api/parking';
import { useAuth } from './AuthContext';

interface ParkingContextType {
  parkings: Parking[];
  stats: ParkingStats | null;
  utilization: ParkingUtilization[];
  isLoading: boolean;
  error: string | null;
  createParking: (data: CreateParkingInput) => Promise<void>;
  updateParking: (id: string, data: CreateParkingInput) => Promise<void>;
  deleteParking: (id: string) => Promise<void>;
  refreshParkings: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider = ({ children }: { children: ReactNode }) => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [stats, setStats] = useState<ParkingStats | null>(null);
  const [utilization, setUtilization] = useState<ParkingUtilization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshParkings = async () => {
    try {
      const data = await parkingService.listParkings();
      setParkings(data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch parkings';
      setError(message);
      toast.error(message);
    }
  };

  const refreshStats = async () => {
    if (user?.role === 'admin') {
      try {
        const [statsData, utilizationData] = await Promise.all([
          parkingService.getParkingStats(),
          parkingService.getParkingUtilization()
        ]);
        setStats(statsData);
        setUtilization(utilizationData);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to fetch parking stats';
        setError(message);
        toast.error(message);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await refreshParkings();
        if (user?.role === 'admin') {
          await refreshStats();
        }
      } catch (err) {
        console.error('Failed to load parking data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.role]);

  const createParking = async (data: CreateParkingInput) => {
    try {
      await parkingService.createParking(data);
      toast.success('Parking created successfully');
      await refreshParkings();
      await refreshStats();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create parking';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const updateParking = async (id: string, data: CreateParkingInput) => {
    try {
      await parkingService.updateParking(id, data);
      toast.success('Parking updated successfully');
      await refreshParkings();
      await refreshStats();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update parking';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const deleteParking = async (id: string) => {
    try {
      await parkingService.deleteParking(id);
      toast.success('Parking deleted successfully');
      await refreshParkings();
      await refreshStats();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete parking';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const value: ParkingContextType = {
    parkings,
    stats,
    utilization,
    isLoading,
    error,
    createParking,
    updateParking,
    deleteParking,
    refreshParkings,
    refreshStats
  };

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
}; 
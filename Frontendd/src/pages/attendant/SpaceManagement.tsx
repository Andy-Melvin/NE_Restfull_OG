
import React, { useState, useEffect } from 'react';
import AttendantLayout from '@/components/layouts/AttendantLayout';
import { parkingApi } from '@/services/api';
import { ParkingUtilization } from '@/types/parking';
import { toast } from "@/components/ui/sonner";

const SpaceManagement: React.FC = () => {
  const [parkingData, setParkingData] = useState<ParkingUtilization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await parkingApi.getParkingUtilization();
        setParkingData(data);
      } catch (error) {
        console.error('Error fetching parking utilization:', error);
        toast.error('Failed to load parking data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 0.5) return 'bg-green-500';
    if (utilization < 0.8) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <AttendantLayout title="Real-time Space Management">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Live Parking Utilization</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkingData.map((parking) => (
                <div key={parking.code} className="border rounded-lg p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900">{parking.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Code: {parking.code}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Total Spaces</p>
                      <p className="text-2xl font-bold text-gray-900">{parking.totalSpaces}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Available</p>
                      <p className="text-2xl font-bold text-gray-900">{parking.availableSpaces}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilization</span>
                      <span>{(parking.currentUtilization * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${getUtilizationColor(parking.currentUtilization)} h-2.5 rounded-full`}
                        style={{ width: `${parking.currentUtilization * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Active cars: {parking.activeCars}</span>
                      <span>
                        {parking.availableSpaces === 0 ? (
                          <span className="text-red-600 font-medium">FULL</span>
                        ) : (
                          <span className="text-green-600 font-medium">AVAILABLE</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {parkingData.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No parking data available
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg text-blue-700 text-sm">
          <p>
            This page automatically updates every 30 seconds to show the current parking utilization.
            In a production environment, this could use WebSockets for real-time updates.
          </p>
        </div>
      </div>
    </AttendantLayout>
  );
};

export default SpaceManagement;

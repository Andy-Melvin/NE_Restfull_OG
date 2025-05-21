import React, { useState, useEffect } from 'react';
import AttendantLayout from '@/components/layouts/AttendantLayout';
import { parkingApi } from '@/services/api';
import { Parking } from '@/types/parking';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AttendantDashboard: React.FC = () => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 parkings per page (2 rows of 3)
  const totalPages = Math.ceil(parkings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParkings = parkings.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await parkingApi.getAllParkings();
        setParkings(Array.isArray(response.data) ? response.data : []);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.response?.data?.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAvailabilityColor = (parking: Parking) => {
    const availableSpaces = parking.availableSpaces || 0;
    const totalSpaces = parking.numberOfSpaces || 0;
    
    // If no spaces available, show red
    if (availableSpaces === 0) return 'bg-red-500';
    
    // If all spaces are available, show green
    if (availableSpaces === totalSpaces) return 'bg-green-500';
    
    // If some spaces are available, show yellow
    return 'bg-yellow-500';
  };

  const getAvailabilityBadgeVariant = (parking: Parking) => {
    const availableSpaces = parking.availableSpaces || 0;
    const totalSpaces = parking.numberOfSpaces || 0;
    
    if (availableSpaces === 0) return "destructive";
    if (availableSpaces === totalSpaces) return "default";
    return "secondary";
  };

  if (error) {
    return (
      <AttendantLayout title="Dashboard">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AttendantLayout>
    );
  }

  return (
    <AttendantLayout title="Dashboard">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Available Spaces</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {parkings.reduce((sum, parking) => sum + (parking.availableSpaces || 0), 0)}
                  <span className="text-sm font-normal text-gray-500"> / {parkings.reduce((sum, parking) => sum + (parking.numberOfSpaces || 0), 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Parking list */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Available Parkings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {currentParkings.map((parking) => {
                const availableSpaces = parking.availableSpaces || 0;
                const totalSpaces = parking.numberOfSpaces || 0;
                const availablePercentage = (availableSpaces / totalSpaces) * 100;
                
                return (
                  <div key={parking.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{parking.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{parking.location}</p>
                      </div>
                      <Badge variant={getAvailabilityBadgeVariant(parking)}>
                        {availableSpaces} / {totalSpaces} spaces
                      </Badge>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Availability</span>
                        <span>{availablePercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${getAvailabilityColor(parking)} h-2 rounded-full`}
                          style={{ width: `${availablePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Code:</span> {parking.code}
                      </div>
                      <div>
                        <span className="text-gray-500">Fee:</span> {parking.chargingFeePerHour.toLocaleString()} FRW/hr
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {parkings.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No parkings available
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            {parkings.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, parkings.length)}</span> of{' '}
                    <span className="font-medium">{parkings.length}</span> parkings
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AttendantLayout>
  );
};

export default AttendantDashboard;

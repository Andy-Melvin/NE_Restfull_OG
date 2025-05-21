import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { parkingApi, carApi } from '@/services/api';
import { Parking, CarParkingRecord } from '@/types/parking';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [activeRecords, setActiveRecords] = useState<CarParkingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state for Active Records
  const [activeRecordsPage, setActiveRecordsPage] = useState(1);
  const activeRecordsPerPage = 6;
  const activeRecordsTotalPages = Math.ceil(activeRecords.length / activeRecordsPerPage);
  const activeRecordsStartIndex = (activeRecordsPage - 1) * activeRecordsPerPage;
  const activeRecordsEndIndex = activeRecordsStartIndex + activeRecordsPerPage;
  const currentActiveRecords = activeRecords.slice(activeRecordsStartIndex, activeRecordsEndIndex);

  // Pagination state for Parking Status
  const [parkingStatusPage, setParkingStatusPage] = useState(1);
  const parkingStatusPerPage = 6;
  const parkingStatusTotalPages = Math.ceil(parkings.length / parkingStatusPerPage);
  const parkingStatusStartIndex = (parkingStatusPage - 1) * parkingStatusPerPage;
  const parkingStatusEndIndex = parkingStatusStartIndex + parkingStatusPerPage;
  const currentParkingStatus = parkings.slice(parkingStatusStartIndex, parkingStatusEndIndex);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [parkingResponse, recordsResponse] = await Promise.all([
          parkingApi.getAllParkings(),
          carApi.getActiveParkings()
        ]);
        
        setParkings(Array.isArray(parkingResponse.data) ? parkingResponse.data : []);
        setActiveRecords(Array.isArray(recordsResponse.data) ? recordsResponse.data : []);
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
      <AdminLayout title="Dashboard">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
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
                <CardTitle className="text-sm font-medium text-gray-500">Total Parkings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{parkings.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active Cars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeRecords.length}</div>
              </CardContent>
            </Card>
            
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
          
          {/* Parking Status */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Parking Status</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parking Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Spaces</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentParkingStatus.map((parking) => {
                    const availableSpaces = parking.availableSpaces || 0;
                    const totalSpaces = parking.numberOfSpaces || 0;
                    const availablePercentage = (availableSpaces / totalSpaces) * 100;
                    
                    return (
                      <TableRow key={parking.id}>
                        <TableCell className="font-medium">{parking.name}</TableCell>
                        <TableCell>{parking.code}</TableCell>
                        <TableCell>{parking.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{availableSpaces} / {totalSpaces}</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`${getAvailabilityColor(parking)} h-2 rounded-full`}
                                style={{ width: `${availablePercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getAvailabilityBadgeVariant(parking)}>
                            {availableSpaces === 0 ? 'Full' : 
                             availableSpaces === totalSpaces ? 'Available' : 
                             'Partially Available'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {parkings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        No parkings available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls for Parking Status */}
            {parkings.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{parkingStatusStartIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(parkingStatusEndIndex, parkings.length)}</span> of{' '}
                    <span className="font-medium">{parkings.length}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setParkingStatusPage(parkingStatusPage - 1)}
                    disabled={parkingStatusPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: parkingStatusTotalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={parkingStatusPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setParkingStatusPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setParkingStatusPage(parkingStatusPage + 1)}
                    disabled={parkingStatusPage === parkingStatusTotalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Active Parking Records */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Parking Records</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Parking Code</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentActiveRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>{record.plateNumber}</TableCell>
                      <TableCell>{record.parkingCode}</TableCell>
                      <TableCell>{new Date(record.entryTime).toLocaleString()}</TableCell>
                      <TableCell>{formatDistanceToNow(new Date(record.entryTime))}</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {currentActiveRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                        No active records
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls for Active Records */}
            {activeRecords.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{activeRecordsStartIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(activeRecordsEndIndex, activeRecords.length)}</span> of{' '}
                    <span className="font-medium">{activeRecords.length}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveRecordsPage(activeRecordsPage - 1)}
                    disabled={activeRecordsPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: activeRecordsTotalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={activeRecordsPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveRecordsPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveRecordsPage(activeRecordsPage + 1)}
                    disabled={activeRecordsPage === activeRecordsTotalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;

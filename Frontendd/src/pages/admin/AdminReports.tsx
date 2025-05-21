import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { reportApi, parkingApi } from '@/services/api';
import { CarParkingRecord, ParkingUtilizationReport, ReportQuery, Parking } from '@/types/parking';
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";

const AdminReports: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedParkingCode, setSelectedParkingCode] = useState<string>('all');
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [isLoadingParkings, setIsLoadingParkings] = useState(true);
  
  const [entryReport, setEntryReport] = useState<CarParkingRecord[]>([]);
  const [exitReport, setExitReport] = useState<CarParkingRecord[]>([]);
  const [utilizationReport, setUtilizationReport] = useState<ParkingUtilizationReport[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  
  const [activeTab, setActiveTab] = useState('entries');

  React.useEffect(() => {
    const fetchParkings = async () => {
      try {
        setIsLoadingParkings(true);
        const response = await parkingApi.getAllParkings();
        setParkings(response.data);
      } catch (error) {
        console.error('Error fetching parkings:', error);
        toast.error('Failed to load parkings');
      } finally {
        setIsLoadingParkings(false);
      }
    };

    fetchParkings();
  }, []);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (startDate > endDate) {
      toast.error("Start date must be before end date");
      return;
    }

    try {
      setIsLoadingReport(true);
      
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      const query: ReportQuery = {
        from: startDateTime.toISOString(),
        to: endDateTime.toISOString(),
        ...(selectedParkingCode !== 'all' && { parkingCode: selectedParkingCode })
      };

      let response;
      switch (activeTab) {
        case 'entries':
          response = await reportApi.getEntryReport(query);
          if (response.data?.message) {
            toast.info(response.data.message);
            setEntryReport([]);
          } else if (response.data?.records) {
            setEntryReport(response.data.records);
            toast.success("Entry report generated successfully");
          } else {
            toast.info("No entry records found for the selected date range");
            setEntryReport([]);
          }
          break;
        case 'exits':
          response = await reportApi.getExitReport(query);
          if (response.data?.message) {
            toast.info(response.data.message);
            setExitReport([]);
          } else if (response.data?.records) {
            setExitReport(response.data.records);
            toast.success("Exit report generated successfully");
          } else {
            toast.info("No exit records found for the selected date range");
            setExitReport([]);
          }
          break;
        case 'utilization':
          response = await reportApi.getUtilizationReport(query);
          if (response.data?.message) {
            toast.info(response.data.message);
            setUtilizationReport([]);
          } else if (response.data?.parkings) {
            setUtilizationReport(response.data.parkings);
            toast.success("Utilization report generated successfully");
          } else {
            toast.info("No utilization data found for the selected date range");
            setUtilizationReport([]);
          }
          break;
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      let errorMessage = "Failed to generate report";
      
      if (error.response?.status === 401) {
        errorMessage = "You are not authorized to generate reports";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid date range or parameters";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      
      setEntryReport([]);
      setExitReport([]);
      setUtilizationReport([]);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const exportReport = () => {
    try {
      let data;
      let filename;
      
      switch (activeTab) {
        case 'entries':
          data = entryReport;
          filename = 'entry-report';
          break;
        case 'exits':
          data = exitReport;
          filename = 'exit-report';
          break;
        case 'utilization':
          data = utilizationReport;
          filename = 'utilization-report';
          break;
      }
      
      if (!data || data.length === 0) {
        toast.error('No data to export');
        return;
      }
      
      const csvContent = convertToCSV(data);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle special cases
          if (value instanceof Date) {
            return value.toISOString();
          }
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'PPpp');
  };

  return (
    <AdminLayout title="Reports">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Generate Reports</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="entries">Car Entries</TabsTrigger>
              <TabsTrigger value="exits">Car Exits</TabsTrigger>
              <TabsTrigger value="utilization">Utilization</TabsTrigger>
            </TabsList>
            
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PP') : 'Select start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PP') : 'Select end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Parking (Optional)</label>
                <Select value={selectedParkingCode} onValueChange={setSelectedParkingCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="All parkings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All parkings</SelectItem>
                    {parkings.map((parking) => (
                      <SelectItem key={parking.code} value={parking.code}>
                        {parking.name} ({parking.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button onClick={handleGenerateReport} disabled={isLoadingReport}>
                {isLoadingReport ? 'Generating...' : 'Generate Report'}
              </Button>
              <Button variant="outline" onClick={exportReport}>
                Export CSV
              </Button>
            </div>
            
            <div className="mt-8">
              <TabsContent value="entries">
                <h3 className="text-lg font-semibold mb-4">Car Entries Report</h3>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record ID</TableHead>
                        <TableHead>Plate Number</TableHead>
                        <TableHead>Parking Code</TableHead>
                        <TableHead>Entry Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entryReport.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.id}</TableCell>
                          <TableCell>{record.plateNumber}</TableCell>
                          <TableCell>{record.parkingCode}</TableCell>
                          <TableCell>{formatDateTime(record.entryTime)}</TableCell>
                        </TableRow>
                      ))}
                      
                      {entryReport.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            No entries found. Generate a report to see data.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="exits">
                <h3 className="text-lg font-semibold mb-4">Car Exits Report</h3>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record ID</TableHead>
                        <TableHead>Plate Number</TableHead>
                        <TableHead>Parking Code</TableHead>
                        <TableHead>Entry Time</TableHead>
                        <TableHead>Exit Time</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exitReport.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.id}</TableCell>
                          <TableCell>{record.plateNumber}</TableCell>
                          <TableCell>{record.parkingCode}</TableCell>
                          <TableCell>{formatDateTime(record.entryTime)}</TableCell>
                          <TableCell>{record.exitTime ? formatDateTime(record.exitTime) : 'N/A'}</TableCell>
                          <TableCell>
                            {record.chargedAmount ? `${record.chargedAmount.toLocaleString()} FRW` : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {exitReport.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No exits found. Generate a report to see data.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="utilization">
                <h3 className="text-lg font-semibold mb-4">Parking Utilization Report</h3>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parking Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Total Spaces</TableHead>
                        <TableHead>Available Spaces</TableHead>
                        <TableHead>Utilization Rate</TableHead>
                        <TableHead>Total Entries</TableHead>
                        <TableHead>Total Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {utilizationReport.map((report) => (
                        <TableRow key={report.parkingCode}>
                          <TableCell>{report.parkingCode}</TableCell>
                          <TableCell>{report.name}</TableCell>
                          <TableCell>{report.totalSpaces}</TableCell>
                          <TableCell>{report.availableSpaces}</TableCell>
                          <TableCell>{report.utilizationRate.toFixed(1)}%</TableCell>
                          <TableCell>{report.totalEntries}</TableCell>
                          <TableCell>${report.totalRevenue.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      
                      {utilizationReport.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No utilization data found. Generate a report to see data.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;

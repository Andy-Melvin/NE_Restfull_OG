
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { toast } from "@/components/ui/sonner";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userEmail: string;
  details: string;
  level: 'info' | 'warning' | 'error';
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevel, setLogLevel] = useState<string>('all');
  const [page, setPage] = useState(1);
  const logsPerPage = 15;

  // Generate some mock logs
  useEffect(() => {
    const generateMockLogs = () => {
      setIsLoading(true);
      
      const actions = [
        'User login', 
        'User logout', 
        'Car entry', 
        'Car exit', 
        'Parking created', 
        'Parking updated',
        'Parking deleted'
      ];
      
      const mockLogs: LogEntry[] = Array.from({ length: 50 }, (_, i) => {
        const date = new Date();
        date.setHours(date.getHours() - Math.floor(Math.random() * 72)); // Random time in the last 72 hours
        
        const actionIndex = Math.floor(Math.random() * actions.length);
        const action = actions[actionIndex];
        
        let details = '';
        let level: 'info' | 'warning' | 'error' = 'info';
        
        switch (action) {
          case 'User login':
            details = 'User logged in successfully';
            break;
          case 'User logout':
            details = 'User logged out';
            break;
          case 'Car entry':
            details = `Car with plate RAB ${Math.floor(Math.random() * 999)}D entered parking`;
            break;
          case 'Car exit':
            details = `Car with plate RAB ${Math.floor(Math.random() * 999)}D exited parking`;
            break;
          case 'Parking created':
            details = `New parking created: PARK00${Math.floor(Math.random() * 9) + 1}`;
            break;
          case 'Parking updated':
            details = `Parking PARK00${Math.floor(Math.random() * 9) + 1} was updated`;
            break;
          case 'Parking deleted':
            details = `Parking PARK00${Math.floor(Math.random() * 9) + 1} was deleted`;
            level = 'warning';
            break;
        }
        
        // Add some errors
        if (i % 15 === 0) {
          level = 'error';
          details = 'Failed to process request: Database connection error';
        } else if (i % 10 === 0) {
          level = 'warning';
          details = 'Parking is reaching capacity (90%)';
        }
        
        return {
          id: `log-${i + 1}`,
          timestamp: date.toISOString(),
          action,
          userId: `user_${Math.floor(Math.random() * 100) + 1}`,
          userEmail: `user${Math.floor(Math.random() * 100) + 1}@example.com`,
          details,
          level
        };
      });
      
      // Sort by most recent
      mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setLogs(mockLogs);
      setIsLoading(false);
    };
    
    generateMockLogs();
  }, []);
  
  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    
    return matchesSearch && matchesLevel;
  });
  
  // Paginate logs
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice((page - 1) * logsPerPage, page * logsPerPage);
  
  const getLevelBadgeClass = (level: string) => {
    switch(level) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };
  
  const exportLogs = () => {
    toast.success('Logs exported successfully');
  };

  return (
    <AdminLayout title="System Logs">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-xl font-bold">System Activity Logs</h2>
            
            <Button variant="outline" onClick={exportLogs}>
              Export Logs
            </Button>
          </div>
          
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="w-full md:w-48">
                <Select value={logLevel} onValueChange={setLogLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="md:w-24">
                Filter
              </Button>
            </form>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getLevelBadgeClass(log.level)}`}>
                            {log.level}
                          </span>
                        </TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.userEmail}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                      </TableRow>
                    ))}
                    
                    {paginatedLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No logs found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {((page - 1) * logsPerPage) + 1} to {Math.min(page * logsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default LogsPage;

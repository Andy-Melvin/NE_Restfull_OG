import React, { useState } from 'react';
import AttendantLayout from '@/components/layouts/AttendantLayout';
import { carApi } from '@/services/api';
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { format, formatDistanceStrict } from 'date-fns';

interface ExitReceipt {
  recordId: string;
  plateNumber: string;
  totalHours: number;
  chargedAmount: number;
  exitTime: string;
}

const CarExit: React.FC = () => {
  const [recordId, setRecordId] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receipt, setReceipt] = useState<ExitReceipt | null>(null);
  const [activeTab, setActiveTab] = useState('record-id');

  const handleExit = async () => {
    if (isLoading) return;
    
    if (activeTab === 'record-id' && !recordId) {
      toast.error('Please enter a record ID');
      return;
    }
    
    if (activeTab === 'plate-number' && !plateNumber) {
      toast.error('Please enter a plate number');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real app, if searching by plate number, we would first fetch the record ID
      const searchId = activeTab === 'record-id' ? recordId : 'record-search-' + Math.random().toString(36).substring(2, 9);
      
      const response = await carApi.registerExit({ recordId: searchId });
      setReceipt(response.data);
      toast.success('Car exit registered successfully');
      
      // Reset form
      setRecordId('');
      setPlateNumber('');
    } catch (error) {
      console.error('Error registering car exit:', error);
      toast.error('Failed to register car exit');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!receipt) return;
    
    // In a real app, this would trigger a print function
    toast.success('Printing receipt...');
    
    // Reset receipt after printing
    setTimeout(() => {
      setReceipt(null);
    }, 2000);
  };

  return (
    <AttendantLayout title="Car Exit">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Car Exit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Register Car Exit</h2>
            
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="record-id">Search by Record ID</TabsTrigger>
                <TabsTrigger value="plate-number">Search by Plate Number</TabsTrigger>
              </TabsList>
              
              <TabsContent value="record-id" className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="record-id" className="text-sm font-medium">
                    Record ID
                  </label>
                  <Input
                    id="record-id"
                    value={recordId}
                    onChange={(e) => setRecordId(e.target.value)}
                    placeholder="Enter parking record ID"
                  />
                </div>
                
                <Button 
                  onClick={handleExit} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Register Exit & Calculate Charges'}
                </Button>
              </TabsContent>
              
              <TabsContent value="plate-number" className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="plate-number" className="text-sm font-medium">
                    License Plate Number
                  </label>
                  <Input
                    id="plate-number"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    placeholder="Format: RAX 123Y"
                    className="uppercase"
                  />
                </div>
                
                <Button 
                  onClick={handleExit}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Search & Register Exit'}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Receipt */}
        <div>
          <div className="bg-white rounded-lg shadow h-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Payment Receipt</h2>
            </div>
            
            {receipt ? (
              <div className="p-6">
                <Card className="border-2 border-dashed">
                  <CardHeader className="pb-2 text-center border-b">
                    <CardTitle>Payment Receipt</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-1">
                      <div className="grid grid-cols-2">
                        <p className="text-sm text-gray-500">Record ID:</p>
                        <p className="text-sm font-medium">{receipt.recordId}</p>
                      </div>
                      <div className="grid grid-cols-2">
                        <p className="text-sm text-gray-500">Plate Number:</p>
                        <p className="text-sm font-medium">{receipt.plateNumber}</p>
                      </div>
                      <div className="grid grid-cols-2">
                        <p className="text-sm text-gray-500">Duration:</p>
                        <p className="text-sm font-medium">
                          {receipt.totalHours.toFixed(1)} hours
                        </p>
                      </div>
                      <div className="grid grid-cols-2">
                        <p className="text-sm text-gray-500">Exit Time:</p>
                        <p className="text-sm font-medium">
                          {format(new Date(receipt.exitTime), 'PPpp')}
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t grid grid-cols-2">
                        <p className="text-sm font-medium">Total Amount:</p>
                        <p className="text-sm font-bold">{receipt.chargedAmount.toLocaleString()} FRW</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 text-xs text-center text-gray-500">
                      <p>Thank you for using our parking service.</p>
                      <p>Have a safe journey!</p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handlePrintReceipt}
                    >
                      Print Receipt
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p className="mb-4">No active receipt</p>
                <p className="text-sm">Register a car exit to generate a receipt</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AttendantLayout>
  );
};

export default CarExit;

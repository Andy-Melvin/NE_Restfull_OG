import React, { useState, useEffect } from 'react';
import AttendantLayout from '@/components/layouts/AttendantLayout';
import { parkingApi, carApi } from '@/services/api';
import { Parking, CarParkingRecord } from '@/types/parking';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const carEntrySchema = z.object({
  plateNumber: z
    .string()
    .min(1, "Plate number is required"),
  parkingCode: z.string().min(1, "Please select a parking"),
});

type CarEntryFormValues = z.infer<typeof carEntrySchema>;

const CarEntry: React.FC = () => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ticket, setTicket] = useState<CarParkingRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CarEntryFormValues>({
    resolver: zodResolver(carEntrySchema),
    defaultValues: {
      plateNumber: "",
      parkingCode: "",
    },
  });

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        setIsLoading(true);
        const response = await parkingApi.getAllParkings();
        setParkings(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching parkings:', error);
        toast.error('Failed to load parkings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParkings();
  }, []);

  const handleSubmit = async (data: CarEntryFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await carApi.registerEntry({
        plateNumber: data.plateNumber,
        parkingCode: data.parkingCode
      });
      
      // Show success message
      toast.success("Car entry registered successfully");
      
      // Reset form
      form.reset();
      
      // Show ticket
      setTicket(response.data);
    } catch (error: any) {
      console.error('Error registering car entry:', error);
      
      // Handle specific error cases
      if (error.message.includes('already entered')) {
        toast.error(error.message);
      } else if (error.response?.status === 400) {
        toast.error("Invalid plate number or parking code");
      } else if (error.response?.status === 404) {
        toast.error("Parking not found");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to register car entries");
      } else {
        toast.error("Failed to register car entry. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintTicket = () => {
    if (!ticket) return;
    
    // In a real app, this would trigger a print function
    toast.success('Printing ticket...');
    
    // Reset ticket after printing
    setTimeout(() => {
      setTicket(null);
    }, 2000);
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString();
  };

  const getSelectedParking = (parkingCode: string) => {
    return parkings.find(p => p.code === parkingCode);
  };

  return (
    <AttendantLayout title="Car Entry">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Car Entry Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Register Car Entry</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter plate number" 
                            {...field} 
                            className="uppercase"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="parkingCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Parking</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a parking" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parkings.map((parking) => (
                              <SelectItem 
                                key={parking.code} 
                                value={parking.code}
                                disabled={parking.availableSpaces === 0}
                              >
                                {parking.name} ({parking.availableSpaces} spaces available)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register Entry'}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
        
        {/* Ticket Preview */}
        <div>
          <div className="bg-white rounded-lg shadow h-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Parking Ticket</h2>
            </div>
            
            {ticket ? (
              <div className="p-6">
                <Card className="border-2 border-dashed">
                  <CardHeader className="pb-2 text-center border-b">
                    <CardTitle>Parking Ticket</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-1">
                      <div className="grid grid-cols-2">
                        <p className="text-sm text-gray-500">Ticket ID:</p>
                        <p className="text-sm font-medium">{ticket.id}</p>
                      </div>
                      <div className="grid grid-cols-2">
                        <p className="text-sm text-gray-500">Plate Number:</p>
                        <p className="text-sm font-medium">{ticket.plateNumber}</p>
                      </div>
                      <div className="grid grid-cols-2">
                        <p className="text-sm text-gray-500">Parking:</p>
                        <p className="text-sm font-medium">
                          {getSelectedParking(ticket.parkingCode)?.name || ticket.parkingCode}
                        </p>
                      </div>
                      <div className="grid grid-cols-2">
                        <p className="text-sm text-gray-500">Entry Time:</p>
                        <p className="text-sm font-medium">
                          {new Date(ticket.entryTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2">
                        <p className="text-sm text-gray-500">Hourly Rate:</p>
                        <p className="text-sm font-medium">
                          {getSelectedParking(ticket.parkingCode)?.chargingFeePerHour.toLocaleString() || 'N/A'} FRW
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 text-xs text-center text-gray-500">
                      <p>Please keep this ticket safe.</p>
                      <p>You will need it when exiting the parking.</p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handlePrintTicket}
                    >
                      Print Ticket
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p className="mb-4">No active ticket</p>
                <p className="text-sm">Register a car entry to generate a ticket</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AttendantLayout>
  );
};

export default CarEntry;

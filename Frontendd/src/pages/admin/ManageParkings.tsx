import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { parkingApi } from '@/services/api';
import { Parking, CreateParkingRequest } from '@/types/parking';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Edit, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const parkingFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  numberOfSpaces: z.number().int().positive("Number of spaces must be positive"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  chargingFeePerHour: z.number().positive("Fee must be positive"),
});

type ParkingFormValues = z.infer<typeof parkingFormSchema>;

const ManageParkings: React.FC = () => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editParkingId, setEditParkingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [parkingToDelete, setParkingToDelete] = useState<Parking | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(parkings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParkings = parkings.slice(startIndex, endIndex);

  const form = useForm<ParkingFormValues>({
    resolver: zodResolver(parkingFormSchema),
    defaultValues: {
      code: "",
      name: "",
      numberOfSpaces: 100,
      location: "",
      chargingFeePerHour: 500,
    },
  });

  useEffect(() => {
    fetchParkings();
  }, []);

  const fetchParkings = async () => {
    try {
      setIsLoading(true);
      const response = await parkingApi.getAllParkings();
      setParkings(response.data || []);
    } catch (error: any) {
      console.error('Error fetching parkings:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load parkings';
      toast.error(errorMessage);
      setParkings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditParkingId(null);
    form.reset({
      code: "",
      name: "",
      numberOfSpaces: 100,
      location: "",
      chargingFeePerHour: 500,
    });
    setDialogOpen(true);
  };

  const handleEditClick = (parking: Parking) => {
    setEditParkingId(parking.id);
    form.reset({
      code: parking.code,
      name: parking.name,
      numberOfSpaces: parking.numberOfSpaces,
      location: parking.location,
      chargingFeePerHour: parking.chargingFeePerHour,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (parking: Parking) => {
    setParkingToDelete(parking);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!parkingToDelete) return;
    
    try {
      setIsSubmitting(true);
      await parkingApi.deleteParking(parkingToDelete.id);
      setParkings(parkings.filter(p => p.id !== parkingToDelete.id));
      toast.success("Parking deleted successfully");
      setDeleteDialogOpen(false);
      setParkingToDelete(null);
    } catch (error: any) {
      console.error('Error deleting parking:', error);
      let errorMessage = "Failed to delete parking";
      
      if (error.response?.status === 403) {
        errorMessage = "You don't have permission to delete this parking";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || "Cannot delete parking with active cars";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: ParkingFormValues) => {
    try {
      setIsSubmitting(true);
      if (editParkingId) {
        const response = await parkingApi.updateParking(editParkingId, {
          code: data.code,
          name: data.name,
          numberOfSpaces: data.numberOfSpaces,
          location: data.location,
          chargingFeePerHour: data.chargingFeePerHour,
        } as CreateParkingRequest);
        setParkings(parkings.map(p => p.id === editParkingId ? response.data : p));
        toast.success("Parking updated successfully");
      } else {
        const response = await parkingApi.createParking({
          code: data.code,
          name: data.name,
          numberOfSpaces: data.numberOfSpaces,
          location: data.location,
          chargingFeePerHour: data.chargingFeePerHour,
        } as CreateParkingRequest);
        setParkings([...parkings, response.data]);
        toast.success("Parking created successfully");
      }
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving parking:', error);
      const errorMessage = error.response?.data?.message || (editParkingId ? "Failed to update parking" : "Failed to create parking");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <AdminLayout title="Manage Parkings">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">All Parkings</h2>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Parking
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Total Spaces</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Fee/Hour</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentParkings.map((parking) => (
                      <TableRow key={parking.id}>
                        <TableCell className="font-medium">{parking.code}</TableCell>
                        <TableCell>{parking.name}</TableCell>
                        <TableCell>{parking.numberOfSpaces}</TableCell>
                        <TableCell>{parking.location}</TableCell>
                        <TableCell>{parking.chargingFeePerHour.toLocaleString()} FRW</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(parking)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(parking)}
                              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {parkings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No parkings found. Click the "Add Parking" button to create one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {parkings.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, parkings.length)}</span> of{' '}
                      <span className="font-medium">{parkings.length}</span> results
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Add/Edit Parking Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editParkingId ? 'Edit Parking' : 'Add New Parking'}</DialogTitle>
            <DialogDescription>
              Fill in the details for the parking area.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parking Code</FormLabel>
                      <FormControl>
                        <Input placeholder="PARK001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parking Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Downtown Parking" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numberOfSpaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Spaces</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="chargingFeePerHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee per Hour (FRW)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editParkingId ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editParkingId ? 'Update' : 'Create'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the parking "{parkingToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                'Delete Parking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ManageParkings;

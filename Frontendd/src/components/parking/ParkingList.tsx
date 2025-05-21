import React, { useState } from 'react';
import { useParking } from '@/contexts/ParkingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Parking } from '@/services/api/parking';
import { ParkingDialog } from './ParkingDialog';

export function ParkingList() {
  const { parkings, isLoading, error, deleteParking } = useParking();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParking, setSelectedParking] = useState<Parking | undefined>(undefined);

  const handleAdd = () => {
    setSelectedParking(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (parking: Parking) => {
    setSelectedParking(parking);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Parking Locations</CardTitle>
        {isAdmin && (
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Parking
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Available Spaces</TableHead>
              <TableHead>Hourly Rate</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {parkings.map((parking) => (
              <TableRow key={parking.id}>
                <TableCell className="font-medium">{parking.code}</TableCell>
                <TableCell>{parking.name}</TableCell>
                <TableCell>{parking.location}</TableCell>
                <TableCell>{parking.availableSpaces}</TableCell>
                <TableCell>{formatCurrency(parking.hourlyRate)}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(parking)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteParking(parking.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <ParkingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parking={selectedParking}
      />
    </Card>
  );
} 
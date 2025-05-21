import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ParkingForm } from './ParkingForm';
import { Parking } from '@/services/api/parking';

interface ParkingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parking?: Parking;
}

export function ParkingDialog({ open, onOpenChange, parking }: ParkingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {parking ? 'Edit Parking' : 'Create New Parking'}
          </DialogTitle>
        </DialogHeader>
        <ParkingForm
          parking={parking}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 
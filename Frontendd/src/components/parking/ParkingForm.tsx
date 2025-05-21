import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useParking } from '@/contexts/ParkingContext';
import { Parking, CreateParkingInput } from '@/services/api/parking';

const parkingSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(10, 'Code must be at most 10 characters'),
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 100 characters'),
  location: z.string().min(5, 'Location must be at least 5 characters').max(200, 'Location must be at most 200 characters'),
  availableSpaces: z.coerce.number().int().min(0, 'Available spaces must be a positive number'),
  hourlyRate: z.coerce.number().min(0, 'Hourly rate must be a positive number').max(1000, 'Hourly rate must be at most 1000'),
}) satisfies z.ZodType<CreateParkingInput>;

type ParkingFormValues = CreateParkingInput;

interface ParkingFormProps {
  parking?: Parking;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ParkingForm({ parking, onSuccess, onCancel }: ParkingFormProps) {
  const { createParking, updateParking } = useParking();
  const isEditing = !!parking;

  const form = useForm<ParkingFormValues>({
    resolver: zodResolver(parkingSchema),
    defaultValues: parking || {
      code: '',
      name: '',
      location: '',
      availableSpaces: 0,
      hourlyRate: 0,
    },
  });

  const onSubmit = async (data: ParkingFormValues) => {
    try {
      if (isEditing) {
        await updateParking(parking.id, data);
      } else {
        await createParking(data);
      }
      onSuccess?.();
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} disabled={isEditing} />
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availableSpaces"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Spaces</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hourlyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Rate</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Update' : 'Create'} Parking
          </Button>
        </div>
      </form>
    </Form>
  );
} 
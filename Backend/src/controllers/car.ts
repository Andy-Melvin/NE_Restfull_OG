import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import HttpException from '../exceptions/HttpException';
import { CarEntryInput, CarExitInput } from '../schema/car.schema';

// Car Entry
export const registerCarEntry = async (req: Request<{}, {}, CarEntryInput>, res: Response, next: NextFunction) => {
  try {
    const { plateNumber, parkingCode } = req.body;

    const parking = await prisma.parking.findUnique({
      where: { code: parkingCode },
    });

    if (!parking) {
      throw new HttpException(404, 'Parking not found');
    }

    if (parking.availableSpaces <= 0) {
      throw new HttpException(400, 'No available spaces in this parking');
    }

    // Check if car is already parked
    const existingRecord = await prisma.carParkingRecord.findFirst({
      where: {
        plateNumber,
        exitTime: null,
      },
    });

    if (existingRecord) {
      throw new HttpException(400, 'Car is already parked');
    }

    const record = await prisma.carParkingRecord.create({
      data: {
        plateNumber,
        parkingCode,
        entryTime: new Date(),
      },
    });

    await prisma.parking.update({
      where: { code: parkingCode },
      data: {
        availableSpaces: { decrement: 1 },
      },
    });

    res.status(201).json({ 
      message: 'Car entry recorded', 
      data: record 
    });
  } catch (err) {
    next(err);
  }
};

// Car Exit
export const registerCarExit = async (req: Request<{}, {}, CarExitInput>, res: Response, next: NextFunction) => {
  try {
    const { recordId } = req.body;

    const record = await prisma.carParkingRecord.findUnique({
      where: { id: recordId },
      include: { parking: true },
    });

    if (!record) {
      throw new HttpException(404, 'Parking record not found');
    }

    if (record.exitTime) {
      throw new HttpException(400, 'Car has already exited');
    }

    const now = new Date();
    const hours = Math.max(1, Math.ceil((now.getTime() - record.entryTime.getTime()) / (1000 * 60 * 60)));
    const chargedAmount = hours * record.parking.chargingFeePerHour;

    const updated = await prisma.carParkingRecord.update({
      where: { id: recordId },
      data: {
        exitTime: now,
        chargedAmount,
      },
    });

    await prisma.parking.update({
      where: { code: record.parkingCode },
      data: {
        availableSpaces: { increment: 1 },
      },
    });

    res.status(200).json({
      message: 'Car exit recorded',
      data: {
        recordId,
        plateNumber: record.plateNumber,
        totalHours: hours,
        chargedAmount,
        exitTime: now,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get active parking records
export const getActiveParkingRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await prisma.carParkingRecord.findMany({
      where: {
        exitTime: null,
      },
      include: {
        parking: {
          select: {
            name: true,
            location: true,
            chargingFeePerHour: true,
          },
        },
      },
      orderBy: {
        entryTime: 'desc',
      },
    });

    res.json({ data: records });
  } catch (err) {
    next(err);
  }
}; 
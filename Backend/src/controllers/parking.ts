import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import HttpException from '../exceptions/HttpException';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const createParking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code, name, location, numberOfSpaces, chargingFeePerHour } = req.body;

    const existing = await prisma.parking.findUnique({ where: { code } });
    if (existing) throw new HttpException(400, 'Parking code already exists');

    const parking = await prisma.parking.create({
      data: {
        code,
        name,
        location,
        numberOfSpaces,
        availableSpaces: numberOfSpaces,
        chargingFeePerHour,
      },
    });

    res.status(201).json({ data: parking });
  } catch (err) {
    next(err);
  }
};

export const listParkings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parkings = await prisma.parking.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ data: parkings });
  } catch (err) {
    next(err);
  }
};

export const getParking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const parking = await prisma.parking.findUnique({
      where: { id },
    });

    if (!parking) throw new HttpException(404, 'Parking not found');

    res.json({ data: parking });
  } catch (err) {
    next(err);
  }
};

export const updateParking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, location, numberOfSpaces, chargingFeePerHour } = req.body;

    if (!req.user) {
      throw new HttpException(401, 'Authentication required');
    }

    const parking = await prisma.parking.findUnique({
      where: { id },
    });

    if (!parking) throw new HttpException(404, 'Parking not found');

    // Only admin can update parking
    if (req.user.role !== 'ADMIN') {
      throw new HttpException(403, 'Only admin can update parking');
    }

    const updated = await prisma.parking.update({
      where: { id },
      data: {
        name,
        location,
        numberOfSpaces,
        chargingFeePerHour,
      },
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteParking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new HttpException(401, 'Authentication required');
    }

    const parking = await prisma.parking.findUnique({
      where: { id },
      include: {
        parkingRecords: {
          where: {
            exitTime: null // Check for active records
          }
        }
      }
    });

    if (!parking) throw new HttpException(404, 'Parking not found');

    // Only admin can delete parking
    if (req.user.role !== 'ADMIN') {
      throw new HttpException(403, 'Only admin can delete parking');
    }

    // Check if there are active parking records
    if (parking.parkingRecords.length > 0) {
      throw new HttpException(400, 'Cannot delete parking with active cars. Please wait until all cars have exited.');
    }

    // Delete all parking records first (cascade delete)
    await prisma.carParkingRecord.deleteMany({
      where: {
        parkingCode: parking.code
      }
    });

    // Then delete the parking
    await prisma.parking.delete({
      where: { id },
    });

    res.json({ message: 'Parking deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export async function getParkingStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await prisma.parking.findMany({
      select: {
        code: true,
        name: true,
        numberOfSpaces: true,
        availableSpaces: true,
        _count: {
          select: {
            parkingRecords: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: stats.map(stat => ({
        ...stat,
        totalRecords: stat._count.parkingRecords
      }))
    });
  } catch (error) {
    next(new HttpException(500, 'Error fetching parking statistics'));
  }
}

export async function getParkingUtilization(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parkings = await prisma.parking.findMany({
      include: {
        parkingRecords: {
          where: {
            exitTime: null // Only active parking records
          }
        }
      }
    });

    const utilization = parkings.map(parking => ({
      code: parking.code,
      name: parking.name,
      totalSpaces: parking.numberOfSpaces,
      availableSpaces: parking.availableSpaces,
      currentUtilization: ((parking.numberOfSpaces - parking.availableSpaces) / parking.numberOfSpaces) * 100,
      activeCars: parking.parkingRecords.length
    }));

    res.json({
      success: true,
      data: utilization
    });
  } catch (error) {
    next(new HttpException(500, 'Error fetching parking utilization'));
  }
} 
import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import HttpException from '../exceptions/HttpException';
import { ReportQueryInput } from '../schema/report.schema';

export const getOutgoingCarsReport = async (
  req: Request<{}, {}, {}, ReportQueryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, to } = req.query;

    const results = await prisma.carParkingRecord.findMany({
      where: {
        exitTime: {
          gte: new Date(from),
          lte: new Date(to),
        },
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
        exitTime: 'desc',
      },
    });

    const totalCharged = results.reduce((sum, r) => sum + (r.chargedAmount || 0), 0);
    const averageStayTime = results.reduce((sum, r) => {
      if (r.exitTime && r.entryTime) {
        return sum + (r.exitTime.getTime() - r.entryTime.getTime());
      }
      return sum;
    }, 0) / (results.length || 1);

    res.status(200).json({
      totalCount: results.length,
      totalCharged,
      averageStayTimeHours: averageStayTime / (1000 * 60 * 60),
      records: results,
    });
  } catch (err) {
    next(err);
  }
};

export const getEnteredCarsReport = async (
  req: Request<{}, {}, {}, ReportQueryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, to } = req.query;

    const results = await prisma.carParkingRecord.findMany({
      where: {
        entryTime: {
          gte: new Date(from),
          lte: new Date(to),
        },
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

    // Calculate peak hours
    const hourlyDistribution = results.reduce((acc, record) => {
      const hour = record.entryTime.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Object.entries(hourlyDistribution)
      .sort(([, a], [, b]) => b - a)[0];

    res.status(200).json({
      totalCount: results.length,
      peakHour: peakHour ? {
        hour: peakHour[0],
        count: peakHour[1],
      } : null,
      records: results,
    });
  } catch (err) {
    next(err);
  }
};

export const getParkingUtilizationReport = async (
  req: Request<{}, {}, {}, ReportQueryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, to } = req.query;

    const parkings = await prisma.parking.findMany({
      include: {
        parkingRecords: {
          where: {
            OR: [
              {
                entryTime: {
                  gte: new Date(from),
                  lte: new Date(to),
                },
              },
              {
                exitTime: {
                  gte: new Date(from),
                  lte: new Date(to),
                },
              },
            ],
          },
        },
      },
    });

    const utilizationReport = parkings.map(parking => ({
      parkingId: parking.id,
      parkingName: parking.name,
      totalSpaces: parking.numberOfSpaces,
      availableSpaces: parking.availableSpaces,
      utilizationRate: ((parking.numberOfSpaces - parking.availableSpaces) / parking.numberOfSpaces) * 100,
      totalEntries: parking.parkingRecords.length,
      totalRevenue: parking.parkingRecords.reduce((sum, record) => sum + (record.chargedAmount || 0), 0),
    }));

    res.status(200).json({
      totalParkings: parkings.length,
      averageUtilizationRate: utilizationReport.reduce((sum, p) => sum + p.utilizationRate, 0) / parkings.length,
      parkings: utilizationReport,
    });
  } catch (err) {
    next(err);
  }
}; 
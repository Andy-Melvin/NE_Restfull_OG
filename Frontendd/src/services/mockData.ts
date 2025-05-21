import { CarParkingRecord, ParkingUtilizationReport } from '@/types/parking';

// Helper function to generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random plate numbers in format RAB023A
const generatePlateNumber = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const num1 = numbers[Math.floor(Math.random() * numbers.length)];
  const num2 = numbers[Math.floor(Math.random() * numbers.length)];
  const num3 = numbers[Math.floor(Math.random() * numbers.length)];
  return `RAB${num1}${num2}${num3}${letter1}`;
};

// Mock parking locations with PARK format codes
const parkingLocations = [
  { code: 'PARK001', name: 'Downtown Central', location: '123 Main St', spaces: 50, fee: 1000 },
  { code: 'PARK002', name: 'Westside Plaza', location: '456 West Ave', spaces: 75, fee: 800 },
  { code: 'PARK003', name: 'Eastside Mall', location: '789 East Blvd', spaces: 100, fee: 1200 },
  { code: 'PARK004', name: 'North Station', location: '321 North Rd', spaces: 60, fee: 900 },
  { code: 'PARK005', name: 'South Terminal', location: '654 South St', spaces: 80, fee: 1100 },
];

// Helper function to generate UUID format ID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to validate date range
const validateDateRange = (from: string, to: string) => {
  const startDate = new Date(from);
  const endDate = new Date(to);
  const targetDate = new Date('2025-05-20');
  const nextDay = new Date('2025-05-21');

  // Set hours for comparison
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  nextDay.setHours(0, 0, 0, 0);

  // Check if start date is before May 20th
  if (startDate < targetDate) {
    return { valid: false, message: 'No data available before May 20th, 2025' };
  }

  // Check if end date is after May 21st
  if (endDate > nextDay) {
    return { valid: false, message: 'No data available after May 21st, 2025' };
  }

  // Check if start date is after May 21st
  if (startDate > nextDay) {
    return { valid: false, message: 'No data available after May 21st, 2025' };
  }

  // Check if end date is before May 20th
  if (endDate < targetDate) {
    return { valid: false, message: 'No data available before May 20th, 2025' };
  }

  return { valid: true };
};

// Generate mock car records with specific date range
const generateMockRecords = (count: number, type: 'entry' | 'exit'): CarParkingRecord[] => {
  const records: CarParkingRecord[] = [];
  const baseDate = new Date('2025-05-20T11:00:00Z'); // Start at 11:00 AM

  for (let i = 0; i < count; i++) {
    const entryTime = new Date(baseDate);
    entryTime.setMinutes(entryTime.getMinutes() + i * 5); // Add 5 minutes between each entry

    const exitTime = type === 'exit' ? new Date(entryTime) : undefined;
    if (exitTime) {
      // Add random duration between 30 minutes and 2 hours 40 minutes
      const durationMinutes = Math.floor(Math.random() * 130) + 30; // 30 to 160 minutes
      exitTime.setMinutes(exitTime.getMinutes() + durationMinutes);
      
      // Ensure exit time doesn't go beyond 1:40 PM
      const maxExitTime = new Date('2025-05-20T13:40:00Z');
      if (exitTime > maxExitTime) {
        exitTime.setTime(maxExitTime.getTime());
      }
    }

    const parking = parkingLocations[Math.floor(Math.random() * parkingLocations.length)];
    const chargedAmount = exitTime ? 
      Math.round((exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60) * parking.fee) : 
      undefined;

    records.push({
      id: generateUUID(),
      plateNumber: generatePlateNumber(),
      parkingCode: parking.code,
      entryTime: entryTime.toISOString(),
      exitTime: exitTime?.toISOString(),
      chargedAmount,
      parking: {
        name: parking.name,
        location: parking.location,
        chargingFeePerHour: parking.fee
      }
    });
  }

  return records;
};

// Pagination helper
const paginateData = <T>(data: T[], page: number, pageSize: number) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    data: data.slice(startIndex, endIndex),
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize)
  };
};

// Generate mock utilization data
const generateMockUtilization = (): ParkingUtilizationReport[] => {
  return parkingLocations.map(parking => {
    const totalSpaces = parking.spaces;
    const availableSpaces = Math.floor(Math.random() * totalSpaces);
    const utilizationRate = ((totalSpaces - availableSpaces) / totalSpaces) * 100;
    const totalEntries = Math.floor(Math.random() * 100) + 20;
    const totalRevenue = Math.floor(Math.random() * 1000000) + 500000;

    return {
      parkingId: parking.code,
      parkingCode: parking.code,
      name: parking.name,
      location: parking.location,
      totalSpaces,
      availableSpaces,
      utilizationRate,
      totalEntries,
      totalRevenue,
    };
  });
};

// Mock API responses with pagination
export const mockReportResponses = {
  getEntryReport: (from: string, to: string, page: number = 1, pageSize: number = 10) => {
    const validation = validateDateRange(from, to);
    if (!validation.valid) {
      return {
        totalCount: 0,
        currentPage: page,
        totalPages: 0,
        pageSize,
        records: [],
        message: validation.message
      };
    }

    const allRecords = generateMockRecords(50, 'entry');
    const { data: records, total, totalPages } = paginateData(allRecords, page, pageSize);
    
    return {
      totalCount: total,
      currentPage: page,
      totalPages,
      pageSize,
      peakHour: {
        hour: Math.floor(Math.random() * 24),
        count: Math.floor(Math.random() * 20) + 10,
      },
      records,
    };
  },

  getExitReport: (from: string, to: string, page: number = 1, pageSize: number = 10) => {
    const validation = validateDateRange(from, to);
    if (!validation.valid) {
      return {
        totalCount: 0,
        currentPage: page,
        totalPages: 0,
        pageSize,
        totalCharged: 0,
        averageStayTimeHours: 0,
        records: [],
        message: validation.message
      };
    }

    const allRecords = generateMockRecords(40, 'exit')
      .filter(record => record.exitTime !== null);
    const { data: records, total, totalPages } = paginateData(allRecords, page, pageSize);
    
    const totalCharged = records.reduce((sum, r) => sum + (r.chargedAmount || 0), 0);
    const averageStayTime = records.reduce((sum, r) => {
      if (r.exitTime && r.entryTime) {
        return sum + (new Date(r.exitTime).getTime() - new Date(r.entryTime).getTime());
      }
      return sum;
    }, 0) / records.length;

    return {
      totalCount: total,
      currentPage: page,
      totalPages,
      pageSize,
      totalCharged,
      averageStayTimeHours: averageStayTime / (1000 * 60 * 60),
      records,
    };
  },

  getUtilizationReport: (from: string, to: string, page: number = 1, pageSize: number = 10) => {
    const validation = validateDateRange(from, to);
    if (!validation.valid) {
      return {
        totalParkings: 0,
        currentPage: page,
        totalPages: 0,
        pageSize,
        averageUtilizationRate: 0,
        parkings: [],
        message: validation.message
      };
    }

    const allParkings = generateMockUtilization();
    const { data: parkings, total, totalPages } = paginateData(allParkings, page, pageSize);
    
    return {
      totalParkings: total,
      currentPage: page,
      totalPages,
      pageSize,
      averageUtilizationRate: parkings.reduce((sum, p) => sum + p.utilizationRate, 0) / parkings.length,
      parkings,
    };
  },
}; 
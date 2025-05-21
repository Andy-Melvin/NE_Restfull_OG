export interface Parking {
  id: string;
  code: string;
  name: string;
  location: string;
  numberOfSpaces: number;
  availableSpaces: number;
  chargingFeePerHour: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParkingRequest {
  code: string;
  name: string;
  location: string;
  numberOfSpaces: number;
  chargingFeePerHour: number;
}

export interface CarParkingRecord {
  id: string;
  plateNumber: string;
  parkingCode: string;
  entryTime: string;
  exitTime?: string;
  chargedAmount?: number;
  parking?: {
    name: string;
    location: string;
    chargingFeePerHour: number;
  };
}

export interface CarEntryRequest {
  plateNumber: string;
  parkingCode: string;
}

export interface CarExitRequest {
  recordId: string;
}

export interface ReportQuery {
  from: string;
  to: string;
  parkingCode?: string;
  page?: number;
  pageSize?: number;
}

export interface ReportResponse<T> {
  records?: T[];
  parkings?: T[];
  totalCount?: number;
  totalCharged?: number;
  averageStayTimeHours?: number;
  peakHour?: {
    hour: number;
    count: number;
  };
  totalParkings?: number;
  averageUtilizationRate?: number;
}

export interface ParkingStatistics {
  id: string;
  code: string;
  name: string;
  totalSpaces: number;
  availableSpaces: number;
  usedSpaces: number;
  usagePercent: number;
}

export interface ParkingUtilization {
  id: string;
  code: string;
  name: string;
  hourlyUtilization: {
    hour: number;
    utilization: number;
  }[];
}

export interface ParkingUtilizationReport {
  parkingId: string;
  parkingCode: string;
  name: string;
  totalSpaces: number;
  availableSpaces: number;
  utilizationRate: number;
  totalEntries: number;
  totalRevenue: number;
}

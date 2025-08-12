export interface AttendanceRecord {
  code: string;
  title: string;
  subtitle: string;
  extras: [{'key': string, 'value': boolean, 'icon': number}];
  scanned: Record<string, number[]>; // session -> array of days
  timestamp?: string; // Keep for compatibility but not used
}

export interface AttendanceStats {
  total: number;
  byBranch: Record<string, number>;
  bySession: Record<string, number>;
  byDay: Record<number, number>;
  sessionAttendance: Record<string, Record<number, number>>; // session -> day -> count
}

export interface FilterOptions {
  branch?: string;
  session?: string;
  day?: number;
  showScannedOnly?: boolean;
}

export type Session = 'Morning' | 'Noon' | 'Afternoon';

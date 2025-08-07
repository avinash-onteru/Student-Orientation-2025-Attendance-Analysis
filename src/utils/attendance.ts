import { AttendanceRecord, AttendanceStats, FilterOptions, Session } from '@/types/attendance';

export function processAttendanceData(data: AttendanceRecord[]): AttendanceStats {
  const stats: AttendanceStats = {
    total: data.length,
    byBranch: {},
    bySession: {},
    byDay: {},
    sessionAttendance: {},
  };

  data.forEach((record) => {
    // Count by branch (using subtitle field)
    if (record.subtitle && record.subtitle.trim()) {
      const branch = record.subtitle.trim();
      stats.byBranch[branch] = (stats.byBranch[branch] || 0) + 1;
    }

    // Process scanned sessions
    if (record.scanned && typeof record.scanned === 'object') {
      Object.entries(record.scanned).forEach(([session, days]) => {
        if (Array.isArray(days)) {
          // Count by session
          stats.bySession[session] = (stats.bySession[session] || 0) + days.length;
          
          // Initialize session attendance if needed
          if (!stats.sessionAttendance[session]) {
            stats.sessionAttendance[session] = {};
          }
          
          // Count by day for each session
          days.forEach((day: number) => {
            stats.byDay[day] = (stats.byDay[day] || 0) + 1;
            stats.sessionAttendance[session][day] = (stats.sessionAttendance[session][day] || 0) + 1;
          });
        }
      });
    }
  });

  return stats;
}

export function filterAttendanceData(
  data: AttendanceRecord[],
  filters: FilterOptions
): AttendanceRecord[] {
  return data.filter((record) => {
    // Filter by branch (subtitle)
    if (filters.branch && record.subtitle !== filters.branch) return false;
    
    // Filter by session
    if (filters.session) {
      if (!record.scanned || !record.scanned[filters.session] || record.scanned[filters.session].length === 0) {
        return false;
      }
    }
    
    // Filter by day
    if (filters.day !== undefined) {
      let foundDay = false;
      if (record.scanned && typeof record.scanned === 'object') {
        Object.values(record.scanned).forEach((days) => {
          if (Array.isArray(days) && days.includes(filters.day!)) {
            foundDay = true;
          }
        });
      }
      if (!foundDay) return false;
    }
    
    // Filter by scanned only (default behavior - show only scanned records unless explicitly disabled)
    const showScannedOnly = filters.showScannedOnly !== false; // Default to true
    if (showScannedOnly) {
      const hasScannedData = record.scanned && Object.keys(record.scanned).length > 0;
      if (!hasScannedData) return false;
    }

    return true;
  });
}

export function getUniqueValues(data: AttendanceRecord[], field: keyof AttendanceRecord): string[] {
  const values = data
    .map((record) => record[field])
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
  
  return Array.from(new Set(values)).sort();
}

export function getBranchesFromData(data: AttendanceRecord[]): string[] {
  const branches = data
    .map(record => record.subtitle?.trim())
    .filter((branch): branch is string => Boolean(branch))
    .filter(branch => branch.length > 0);
  
  return Array.from(new Set(branches)).sort();
}

export function getSessionsFromData(data: AttendanceRecord[]): string[] {
  const sessions = new Set<string>();
  
  data.forEach(record => {
    if (record.scanned && typeof record.scanned === 'object') {
      Object.keys(record.scanned).forEach(session => {
        sessions.add(session);
      });
    }
  });
  
  return Array.from(sessions).sort();
}

export function getDaysFromData(data: AttendanceRecord[]): number[] {
  const days = new Set<number>();
  
  data.forEach(record => {
    if (record.scanned && typeof record.scanned === 'object') {
      Object.values(record.scanned).forEach((dayArray) => {
        if (Array.isArray(dayArray)) {
          dayArray.forEach(day => days.add(day));
        }
      });
    }
  });
  
  return Array.from(days).sort((a, b) => a - b);
}

export function getScannedCounts(data: AttendanceRecord[]): { scanned: number; unscanned: number } {
  const scanned = data.filter(record => record.scanned && Object.keys(record.scanned).length > 0).length;
  const unscanned = data.length - scanned;
  return { scanned, unscanned };
}

export function getSessionLabel(session: string): string {
  const labels: Record<string, string> = {
    'Morning': 'Morning Session',
    'Noon': 'Noon Session', 
    'Afternoon': 'Afternoon Session'
  };
  return labels[session] || session;
}

export function getTotalAttendanceBySession(data: AttendanceRecord[]): Record<string, number> {
  const totals: Record<string, number> = {};
  
  data.forEach(record => {
    if (record.scanned && typeof record.scanned === 'object') {
      Object.entries(record.scanned).forEach(([session, days]) => {
        if (Array.isArray(days)) {
          totals[session] = (totals[session] || 0) + days.length;
        }
      });
    }
  });
  
  return totals;
}

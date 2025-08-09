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
    

    // Filter by scanned only (default behavior - show all records unless explicitly enabled)
    const showScannedOnly = filters.showScannedOnly === true; // Default to false
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

export interface RetentionAnalytics {
  totalRegistered: number;
  totalAttended: number;
  totalAbsent: number;
  attendanceRate: number;
  absenteeRate: number;
  retentionBySession: Record<string, {
    registered: number;
    attended: number;
    retentionRate: number;
  }>;
  retentionByDay: Record<number, {
    registered: number;
    attended: number;
    retentionRate: number;
  }>;
  progressiveRetention: Array<{
    day: number;
    cumulativeAttended: number;
    cumulativeRetention: number;
  }>;
}

export function calculateRetentionAnalytics(data: AttendanceRecord[]): RetentionAnalytics {
  const totalRegistered = data.length;
  const totalAttended = data.filter(record => 
    record.scanned && Object.keys(record.scanned).length > 0
  ).length;
  const totalAbsent = totalRegistered - totalAttended;
  
  const attendanceRate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;
  const absenteeRate = 100 - attendanceRate;

  // Calculate retention by session
  const retentionBySession: Record<string, { registered: number; attended: number; retentionRate: number }> = {};
  const sessions = getSessionsFromData(data);
  
  sessions.forEach(session => {
    const sessionAttendees = data.filter(record => 
      record.scanned && record.scanned[session] && record.scanned[session].length > 0
    ).length;
    
    retentionBySession[session] = {
      registered: totalRegistered,
      attended: sessionAttendees,
      retentionRate: totalRegistered > 0 ? (sessionAttendees / totalRegistered) * 100 : 0
    };
  });

  // Calculate retention by day
  const retentionByDay: Record<number, { registered: number; attended: number; retentionRate: number }> = {};
  const days = getDaysFromData(data);
  
  days.forEach(day => {
    const dayAttendees = data.filter(record => {
      if (!record.scanned) return false;
      return Object.values(record.scanned).some(dayArray => 
        Array.isArray(dayArray) && dayArray.includes(day)
      );
    }).length;
    
    retentionByDay[day] = {
      registered: totalRegistered,
      attended: dayAttendees,
      retentionRate: totalRegistered > 0 ? (dayAttendees / totalRegistered) * 100 : 0
    };
  });

  // Calculate progressive retention (cumulative over days)
  const progressiveRetention = days.sort((a, b) => a - b).map(day => {
    const upToDay = days.filter(d => d <= day);
    const cumulativeAttended = data.filter(record => {
      if (!record.scanned) return false;
      return Object.values(record.scanned).some(dayArray => 
        Array.isArray(dayArray) && dayArray.some(d => upToDay.includes(d))
      );
    }).length;
    
    return {
      day,
      cumulativeAttended,
      cumulativeRetention: totalRegistered > 0 ? (cumulativeAttended / totalRegistered) * 100 : 0
    };
  });

  return {
    totalRegistered,
    totalAttended,
    totalAbsent,
    attendanceRate,
    absenteeRate,
    retentionBySession,
    retentionByDay,
    progressiveRetention
  };
}

export interface GrowthMetrics {
  dailyGrowth: Array<{
    day: number;
    newAttendees: number;
    cumulativeAttendees: number;
    growthRate: number;
  }>;
  sessionGrowth: Record<string, {
    totalAttendees: number;
    averagePerDay: number;
    peakDay: number;
    peakAttendance: number;
  }>;
}

export function calculateGrowthMetrics(data: AttendanceRecord[]): GrowthMetrics {
  const days = getDaysFromData(data).sort((a, b) => a - b);
  const sessions = getSessionsFromData(data);
  
  // Calculate daily growth
  const attendeesByDay = new Map<number, Set<string>>();
  
  data.forEach(record => {
    if (record.scanned) {
      Object.values(record.scanned).forEach(dayArray => {
        if (Array.isArray(dayArray)) {
          dayArray.forEach(day => {
            if (!attendeesByDay.has(day)) {
              attendeesByDay.set(day, new Set());
            }
            attendeesByDay.get(day)!.add(record.code);
          });
        }
      });
    }
  });

  const allAttendees = new Set<string>();
  const dailyGrowth = days.map((day, index) => {
    const dayAttendees = attendeesByDay.get(day) || new Set();
    const newAttendees = [...dayAttendees].filter(code => !allAttendees.has(code));
    
    newAttendees.forEach(code => allAttendees.add(code));
    
    const growthRate = index > 0 ? 
      (newAttendees.length / Math.max(1, attendeesByDay.get(days[index - 1])?.size || 1)) * 100 : 0;
    
    return {
      day,
      newAttendees: newAttendees.length,
      cumulativeAttendees: allAttendees.size,
      growthRate
    };
  });

  // Calculate session growth
  const sessionGrowth: Record<string, any> = {};
  
  sessions.forEach(session => {
    const sessionData: Record<number, number> = {};
    
    data.forEach(record => {
      if (record.scanned && record.scanned[session]) {
        record.scanned[session].forEach(day => {
          sessionData[day] = (sessionData[day] || 0) + 1;
        });
      }
    });

    const attendanceCounts = Object.values(sessionData);
    const peakAttendance = Math.max(...attendanceCounts, 0);
    const peakDay = Object.entries(sessionData).find(([_, count]) => count === peakAttendance)?.[0];
    
    sessionGrowth[session] = {
      totalAttendees: attendanceCounts.reduce((sum, count) => sum + count, 0),
      averagePerDay: attendanceCounts.length > 0 ? attendanceCounts.reduce((sum, count) => sum + count, 0) / attendanceCounts.length : 0,
      peakDay: peakDay ? parseInt(peakDay) : 0,
      peakAttendance
    };
  });

  return {
    dailyGrowth,
    sessionGrowth
  };
}

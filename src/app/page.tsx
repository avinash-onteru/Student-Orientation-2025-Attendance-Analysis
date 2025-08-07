'use client';

import { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStats, FilterOptions } from '@/types/attendance';
import {
  processAttendanceData,
  filterAttendanceData,
  getBranchesFromData,
  getSessionsFromData,
  getDaysFromData,
  getScannedCounts,
} from '@/utils/attendance';
import DashboardCharts from '@/components/DashboardCharts';
import AttendanceFilters from '@/components/AttendanceFilters';
import StatsSummary from '@/components/StatsSummary';
import { Download, FileText } from 'lucide-react';

export default function Home() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    byBranch: {},
    bySession: {},
    byDay: {},
    sessionAttendance: {},
  });
  const [filters, setFilters] = useState<FilterOptions>({ showScannedOnly: true });
  const [loading, setLoading] = useState(true);

  // Load attendance data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/attendance');
        const rawData = await response.json();
        
        // Use the raw data directly - no need for sample data generation
        setAttendanceData(rawData);
        setFilteredData(rawData);
        setStats(processAttendanceData(rawData));
      } catch (error) {
        console.error('Error loading attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    const filtered = filterAttendanceData(attendanceData, filters);
    setFilteredData(filtered);
    setStats(processAttendanceData(filtered));
  }, [attendanceData, filters]);

  const availableBranches = getBranchesFromData(attendanceData);
  const availableSessions = getSessionsFromData(attendanceData);
  const availableDays = getDaysFromData(attendanceData);
  const scannedCounts = getScannedCounts(attendanceData);

  const exportReport = () => {
    const reportData = {
      summary: {
        totalAttendance: stats.total,
        reportDate: new Date().toISOString(),
        filters: filters,
      },
      statistics: stats,
      attendanceRecords: filteredData,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Student Orientation 2025 7th Attendance Report
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Comprehensive attendance tracking and analytics
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportReport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{stats.total} Total Records</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <AttendanceFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableBranches={availableBranches}
          availableSessions={availableSessions}
          availableDays={availableDays}
        />

        {/* Statistics Summary */}
        <div className="mt-8">
          <StatsSummary stats={stats} scannedCounts={scannedCounts} />
        </div>

        {/* Charts */}
        <div className="mt-8">
          <DashboardCharts stats={stats} />
        </div>

        {/* Additional Details */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Top Branches</h4>
              <div className="space-y-2">
                {Object.entries(stats.byBranch)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([branch, count]) => (
                    <div key={branch} className="flex justify-between">
                      <span className="text-sm text-gray-600">{branch}</span>
                      <span className="text-sm font-medium">{count} students</span>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Session Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(stats.bySession)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 4)
                  .map(([session, count]) => (
                    <div key={session} className="flex justify-between">
                      <span className="text-sm text-gray-600 capitalize">{session}</span>
                      <span className="text-sm font-medium">{count as number} students</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Student Orientation 2025 - Attendance Report System</p>
            <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

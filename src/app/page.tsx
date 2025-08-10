'use client';

import { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStats, FilterOptions } from '@/types/attendance';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import {
  processAttendanceData,
  filterAttendanceData,
  getBranchesFromData,
  getSessionsFromData,
  getDaysFromData,
  getScannedCounts,
  calculateRetentionAnalytics,
  calculateGrowthMetrics,
  RetentionAnalytics,
  GrowthMetrics,
} from '@/utils/attendance';
import DashboardCharts from '@/components/DashboardCharts';
import AttendanceFilters from '@/components/AttendanceFilters';
import StatsSummary from '@/components/StatsSummary';
import RetentionAnalyticsComponent from '@/components/RetentionAnalytics';
import { Download, FileText, BarChart3, TrendingUp, Wifi, WifiOff } from 'lucide-react';

export default function Home() {
  const { attendanceData, loading, error, isRealTime } = useAttendanceData();
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    byBranch: {},
    bySession: {},
    byDay: {},
    sessionAttendance: {},
  });
  const [retentionAnalytics, setRetentionAnalytics] = useState<RetentionAnalytics>({
    totalRegistered: 0,
    totalAttended: 0,
    totalAbsent: 0,
    attendanceRate: 0,
    absenteeRate: 0,
    retentionBySession: {},
    retentionByDay: {},
    progressiveRetention: [],
  });
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics>({
    dailyGrowth: [],
    sessionGrowth: {},
  });
  const [filters, setFilters] = useState<FilterOptions>({ showScannedOnly: false });
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  // Initialize filtered data when attendance data loads
  useEffect(() => {
    if (attendanceData.length > 0) {
      setFilteredData(attendanceData);
      setStats(processAttendanceData(attendanceData));
      setRetentionAnalytics(calculateRetentionAnalytics(attendanceData));
      setGrowthMetrics(calculateGrowthMetrics(attendanceData));
    }
  }, [attendanceData]);

  // Apply filters
  useEffect(() => {
    const filtered = filterAttendanceData(attendanceData, filters);
    setFilteredData(filtered);
    setStats(processAttendanceData(filtered));
    setRetentionAnalytics(calculateRetentionAnalytics(filtered));
    setGrowthMetrics(calculateGrowthMetrics(filtered));
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error loading data: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
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
                Student Orientation 2025 Attendance Report
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
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isRealTime 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isRealTime ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span className="font-medium">
                  {isRealTime ? 'Live Data' : 'Static Data'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview & Charts</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Retention & Growth Analytics</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

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

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <>
            {/* Statistics Summary */}
            <div className="mt-8">
              <StatsSummary stats={stats} scannedCounts={scannedCounts} />
            </div>

            {/* Charts */}
            <div className="mt-8">
              <DashboardCharts stats={stats} />
            </div>
          </>
        ) : (
          <>
            {/* Retention Analytics */}
            <div className="mt-8">
              <RetentionAnalyticsComponent 
                retentionData={retentionAnalytics} 
                growthData={growthMetrics} 
              />
            </div>
          </>
        )}

        {/* Additional Details - Show on both tabs */}
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

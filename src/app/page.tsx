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
import { Download, FileText, BarChart3, TrendingUp, Wifi, WifiOff, Moon, Sun } from 'lucide-react';

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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for stored theme preference or system preference on mount
  useEffect(() => {
    // Check if there's a stored preference
    const storedTheme = localStorage.getItem('theme');
    let isDark = false;
    
    if (storedTheme) {
      isDark = storedTheme === 'dark';
    } else {
      // Fall back to system preference
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    setIsDarkMode(isDark);
    
    // Apply the theme to html element
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Store preference in localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    // Toggle the dark class on html element
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Student Orientation 2025 Attendance Report
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{attendanceData.length} Total Records</span>
              </div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isRealTime 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
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
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Retention & Growth Analytics</span>
                </div>
              </button>
            </nav>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">
                {isDarkMode ? 'Light' : 'Dark'}
              </span>
            </button>
          </div>
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
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Detailed Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Top Branches</h4>
              <div className="space-y-2">
                {Object.entries(stats.byBranch)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([branch, count]) => (
                    <div key={branch} className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{branch}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{count} students</span>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Session Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(stats.bySession)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 4)
                  .map(([session, count]) => (
                    <div key={session} className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{session}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{count as number} students</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Student Orientation 2025 - Attendance Report System</p>
            <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

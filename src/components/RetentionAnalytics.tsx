'use client';

import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { GrowthMetrics, RetentionAnalytics } from '../utils/attendance';

interface RetentionAnalyticsProps {
  retentionData: RetentionAnalytics;
  growthData: GrowthMetrics;
}

// Custom tooltip component for dark mode
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
        {label && <p className="text-gray-900 dark:text-gray-100 font-medium">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-gray-700 dark:text-gray-300">
            <span style={{ color: entry.color }}>{entry.name || entry.dataKey}: </span>
            {entry.value}
            {entry.name === 'Retention Rate' && '%'}
            {entry.name?.includes('students') || entry.dataKey === 'value' ? ' students' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RetentionAnalyticsComponent({ retentionData, growthData }: RetentionAnalyticsProps) {
  // Prepare chart data
  const sessionRetentionData = Object.entries(retentionData.retentionBySession).map(([session, data]) => ({
    session: session.charAt(0).toUpperCase() + session.slice(1),
    retention: Math.round(data.retentionRate * 10) / 10,
    attended: data.attended,
    registered: data.registered
  }));

  const dayRetentionData = Object.entries(retentionData.retentionByDay)
    .map(([day, data]) => ({
      day: `Day ${day}`,
      retention: Math.round(data.retentionRate * 10) / 10,
      attended: data.attended
    }))
    .sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]));

  const attendanceBreakdown = [
    { name: 'Attended', value: retentionData.totalAttended, color: '#10b981' },
    { name: 'Absent', value: retentionData.totalAbsent, color: '#ef4444' }
  ];

  const progressiveRetentionData = retentionData.progressiveRetention.map(item => ({
    day: `Day ${item.day}`,
    retention: Math.round(item.cumulativeRetention * 10) / 10,
    attended: item.cumulativeAttended
  }));

  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-xl border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Overall Attendance Rate</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {Math.round(retentionData.attendanceRate * 10) / 10}%
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                {retentionData.totalAttended} of {retentionData.totalRegistered} students
              </p>
            </div>
            <div className="bg-green-500 dark:bg-green-600 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-6 rounded-xl border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">Absentee Rate</p>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                {Math.round(retentionData.absenteeRate * 10) / 10}%
              </p>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {retentionData.totalAbsent} students absent
              </p>
            </div>
            <div className="bg-red-500 dark:bg-red-600 p-3 rounded-full">
              <UserX className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Peak Retention Day</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {retentionData.progressiveRetention.length > 0 ? (
                  `Day ${retentionData.progressiveRetention.reduce((max, item) =>
                    item.cumulativeRetention > max.cumulativeRetention ? item : max,
                    retentionData.progressiveRetention[0]
                  ).day}`
                ) : 'N/A'}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                {retentionData.progressiveRetention.length > 0 ? (
                  `${Math.round(retentionData.progressiveRetention.reduce((max, item) =>
                    item.cumulativeRetention > max.cumulativeRetention ? item : max,
                    retentionData.progressiveRetention[0]
                  ).cumulativeRetention * 10) / 10}% retention`
                ) : 'No data'}
              </p>
            </div>
            <div className="bg-blue-500 dark:bg-blue-600 p-3 rounded-full">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Average Daily Growth</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {growthData.dailyGrowth.length > 0 ? (
                  Math.round((growthData.dailyGrowth.reduce((sum, item) => sum + item.newAttendees, 0) /
                    Math.max(1, growthData.dailyGrowth.length)) * 10) / 10
                ) : 0}
              </p>
              <p className="text-purple-600 dark:text-purple-400 text-sm mt-1">new attendees/day</p>
            </div>
            <div className="bg-purple-500 dark:bg-purple-600 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance vs Absence Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Attendance Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendanceBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => {
                  const percentage = (percent || 0) * 100;
                  // Only show label if segment is 8% or larger (since this is usually just 2 segments)
                  return percentage >= 8 ? `${name}: ${value} (${percentage.toFixed(1)}%)` : '';
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attendanceBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Attended ({retentionData.totalAttended})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Absent ({retentionData.totalAbsent})</span>
            </div>
          </div>
        </div>

        {/* Progressive Retention Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Cumulative Retention Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={progressiveRetentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis dataKey="day" tick={{ fill: 'currentColor' }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'currentColor' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="retention"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                name="Retention Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Session Retention Comparison */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-orange-500" />
            Retention by Session
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sessionRetentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis dataKey="session" tick={{ fill: 'currentColor' }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'currentColor' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="retention" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Retention Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Retention Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-blue-500" />
            Daily Retention Rates
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dayRetentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis dataKey="day" tick={{ fill: 'currentColor' }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'currentColor' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="retention"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Retention Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-blue-200 dark:border-gray-600">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Best Performing Session</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {Object.keys(retentionData.retentionBySession).length > 0 ? (
                (() => {
                  const bestSession = Object.entries(retentionData.retentionBySession).reduce((max, [session, data]) =>
                    data.retentionRate > max.rate ? { session, rate: data.retentionRate } : max,
                    { session: '', rate: -1 }
                  );
                  return bestSession.session.charAt(0).toUpperCase() + bestSession.session.slice(1);
                })()
              ) : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {Object.keys(retentionData.retentionBySession).length > 0 ? (
                `${Math.round(Object.entries(retentionData.retentionBySession).reduce((max, [session, data]) =>
                  data.retentionRate > max.rate ? { session, rate: data.retentionRate } : max,
                  { session: '', rate: -1 }
                ).rate * 10) / 10}% retention rate`
              ) : 'No session data'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Improvement Opportunity</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {retentionData.absenteeRate > 30 ? 'High Absenteeism' :
                retentionData.absenteeRate > 15 ? 'Moderate Absenteeism' : 'Low Absenteeism'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Focus on engaging {retentionData.totalAbsent} absent students
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trend Direction</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center">
              {retentionData.progressiveRetention.length > 1 ? (
                retentionData.progressiveRetention[retentionData.progressiveRetention.length - 1]?.cumulativeRetention >
                  retentionData.progressiveRetention[0]?.cumulativeRetention ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Improving
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Declining
                  </>
                )
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-1" />
                  Insufficient Data
                </>
              )}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {retentionData.progressiveRetention.length > 1 ? 'Retention trend over time' : 'Need more data points'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

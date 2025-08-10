'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { AttendanceStats } from '@/types/attendance';

interface DashboardChartsProps {
  stats: AttendanceStats;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function DashboardCharts({ stats }: DashboardChartsProps) {
  // Prepare data for charts
  const branchData = Object.entries(stats.byBranch).map(([branch, count]) => ({
    name: branch,
    value: count,
  }));

  const sessionData = Object.entries(stats.bySession).map(([session, count]) => ({
    name: session.charAt(0).toUpperCase() + session.slice(1),
    value: count,
    fullName: session
  }));

  const dayData = Object.entries(stats.byDay)
    .map(([day, count]) => ({
      day: `Day ${day}`,
      count,
    }))
    .sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Branch Distribution */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Attendance by Branch</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={branchData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => {
                const percentage = (percent || 0) * 100;
                // Only show label if segment is 5% or larger
                return percentage >= 5 ? `${name} ${percentage.toFixed(0)}%` : '';
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {branchData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} students`, name]} />
          </PieChart>
        </ResponsiveContainer>
        {/* Legend for small segments */}
        <div className="mt-4 grid grid-cols-2 gap-1 text-xs">
          {branchData.map((entry, index) => (
            <div key={entry.name} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-gray-600 dark:text-gray-400 truncate">
                {entry.name}: {entry.value} ({((entry.value / branchData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Session Distribution */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Attendance by Session</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sessionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Day Distribution */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Attendance by Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" stroke="#8884d8" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

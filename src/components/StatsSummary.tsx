'use client';

import { AttendanceStats } from '@/types/attendance';
import { Users, Clock, TrendingUp, CheckCircle } from 'lucide-react';

interface StatsSummaryProps {
  stats: AttendanceStats;
  scannedCounts?: { scanned: number; unscanned: number };
}

export default function StatsSummary({ stats, scannedCounts }: StatsSummaryProps) {
  const totalBranches = Object.keys(stats.byBranch).length;
  const mostActiveSession = Object.entries(stats.bySession).reduce(
    (max, [session, count]) => ((count as number) > max.count ? { session, count: count as number } : max),
    { session: 'Morning', count: 0 }
  );

  const statsCards = [
    {
      title: 'Total Attendance',
      value: stats.total.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      description: 'Students registered',
    },
    {
      title: 'Scanned Records',
      value: scannedCounts ? scannedCounts.scanned.toLocaleString() : 'N/A',
      icon: CheckCircle,
      color: 'bg-green-500',
      description: scannedCounts ? `${scannedCounts.unscanned} unscanned` : 'Scanning data',
    },
    {
      title: 'Branches',
      value: totalBranches.toString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
      description: 'Different branches',
    },
    {
      title: 'Most Active Period',
      value: mostActiveSession.session.charAt(0).toUpperCase() + mostActiveSession.session.slice(1),
      icon: Clock,
      color: 'bg-orange-500',
      description: `${mostActiveSession.count} attendees`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

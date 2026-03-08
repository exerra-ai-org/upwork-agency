'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface FunnelMetric {
  stage: string;
  count: number;
  conversionRate: number;
}

interface DashboardAnalytics {
  funnel: FunnelMetric[];
  summary: {
    totalProposals: number;
    totalMeetings: number;
    totalDeals: number;
    totalRevenue: number;
    avgDealSize: number;
    winRate: number;
  };
  recentTrends: {
    period: string;
    proposals: number;
    meetings: number;
    deals: number;
    revenue: number;
  }[];
}

const fallbackData: DashboardAnalytics = {
  funnel: [
    { stage: 'Proposals Sent', count: 2847, conversionRate: 100 },
    { stage: 'Viewed', count: 1982, conversionRate: 69.6 },
    { stage: 'Shortlisted', count: 743, conversionRate: 37.5 },
    { stage: 'Interview', count: 312, conversionRate: 42.0 },
    { stage: 'Won', count: 156, conversionRate: 50.0 },
  ],
  summary: {
    totalProposals: 2847,
    totalMeetings: 312,
    totalDeals: 156,
    totalRevenue: 482300,
    avgDealSize: 3092,
    winRate: 50.0,
  },
  recentTrends: [
    { period: 'Jan', proposals: 210, meetings: 28, deals: 12, revenue: 37100 },
    { period: 'Feb', proposals: 245, meetings: 31, deals: 14, revenue: 43300 },
    { period: 'Mar', proposals: 280, meetings: 35, deals: 18, revenue: 55700 },
    { period: 'Apr', proposals: 260, meetings: 30, deals: 15, revenue: 46400 },
    { period: 'May', proposals: 295, meetings: 38, deals: 20, revenue: 61900 },
    { period: 'Jun', proposals: 310, meetings: 42, deals: 22, revenue: 68100 },
  ],
};

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery<DashboardAnalytics>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    },
    placeholderData: fallbackData,
  });

  const data = analytics || fallbackData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Proposals', value: data.summary.totalProposals.toLocaleString() },
            { label: 'Total Meetings', value: data.summary.totalMeetings.toLocaleString() },
            { label: 'Deals Won', value: data.summary.totalDeals.toLocaleString() },
            { label: 'Revenue', value: `$${data.summary.totalRevenue.toLocaleString()}` },
            { label: 'Avg Deal Size', value: `$${data.summary.avgDealSize.toLocaleString()}` },
            { label: 'Win Rate', value: `${data.summary.winRate}%` },
          ].map((item) => (
            <div key={item.label} className="card p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Conversion Funnel
          </h2>
          <div className="space-y-4">
            {data.funnel.map((stage, index) => {
              const maxCount = data.funnel[0].count;
              const widthPercent = Math.max((stage.count / maxCount) * 100, 8);
              return (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-32 flex-shrink-0 text-sm text-gray-600 dark:text-slate-300 text-right">
                    {stage.stage}
                  </div>
                  <div className="flex-1 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: `hsl(${220 - index * 20}, 70%, ${55 + index * 5}%)`,
                      }}
                    >
                      <span className="text-sm font-medium text-white drop-shadow-sm">
                        {stage.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-500 dark:text-slate-400 text-right">
                    {index === 0 ? '—' : `${stage.conversionRate}%`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trends Table */}
        <div className="card overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Trends</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Proposals
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Meetings
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Deals
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {data.recentTrends.map((row) => (
                  <tr key={row.period} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {row.period}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                      {row.proposals}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                      {row.meetings}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                      {row.deals}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                      ${row.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Over Time
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-700/30 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-600">
            <div className="text-center">
              <p className="text-gray-400 dark:text-slate-500 text-sm">
                Chart visualization placeholder
              </p>
              <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">
                Integrate a charting library (e.g. Recharts, Chart.js) for interactive charts
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

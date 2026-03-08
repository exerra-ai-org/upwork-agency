import Link from 'next/link';

const stats = [
  {
    label: 'Total Proposals',
    value: '2,847',
    change: '+12.5%',
    trend: 'up' as const,
    href: '/proposals',
  },
  {
    label: 'Active Meetings',
    value: '38',
    change: '+4.2%',
    trend: 'up' as const,
    href: '/meetings',
  },
  {
    label: 'Won Deals',
    value: '156',
    change: '+8.1%',
    trend: 'up' as const,
    href: '/deals',
  },
  {
    label: 'Revenue',
    value: '$482,300',
    change: '+22.4%',
    trend: 'up' as const,
    href: '/analytics',
  },
];

const navLinks = [
  { label: 'Proposals', href: '/proposals', description: 'Manage and track all proposals' },
  { label: 'Meetings', href: '/meetings', description: 'View upcoming and past meetings' },
  { label: 'Deals', href: '/deals', description: 'Pipeline and deal management' },
  { label: 'Analytics', href: '/analytics', description: 'Performance metrics and insights' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AOP Platform Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Agency Operations Platform — Overview
              </p>
            </div>
            <Link
              href="/login"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className="card p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === 'up'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation Cards */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Navigation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="card p-6 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 cursor-pointer group">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {link.label}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{link.description}</p>
                <div className="mt-4 text-sm font-medium text-primary-600 dark:text-primary-400">
                  View →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity Placeholder */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="card p-6">
            <div className="space-y-4">
              {[
                {
                  action: 'Proposal submitted',
                  target: 'React Dashboard Project',
                  time: '2 hours ago',
                },
                {
                  action: 'Meeting completed',
                  target: 'Client onboarding call',
                  time: '4 hours ago',
                },
                { action: 'Deal won', target: 'E-commerce Platform Redesign', time: '1 day ago' },
                { action: 'Task completed', target: 'API integration review', time: '1 day ago' },
                { action: 'New proposal', target: 'Mobile App Development', time: '2 days ago' },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      {' — '}
                      {activity.target}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap ml-4">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

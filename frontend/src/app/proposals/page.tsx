'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Proposal, PaginatedResponse, ProposalStatus } from '@/types';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Viewed', value: 'viewed' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Interview', value: 'interview' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Withdrawn', value: 'withdrawn' },
];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  viewed: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  shortlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  interview: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  withdrawn: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function ProposalsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 10;

  const { data, isLoading, isError, error } = useQuery<PaginatedResponse<Proposal>>({
    queryKey: ['proposals', page, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/proposals', { params });
      return res.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
              >
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proposals</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input max-w-xs"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {data ? `${data.meta.total} total proposals` : 'Loading...'}
          </span>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Bid Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {isLoading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500 dark:text-slate-400"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Loading proposals...
                      </div>
                    </td>
                  </tr>
                )}

                {isError && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                      Failed to load proposals. {(error as Error)?.message || 'Unknown error'}
                    </td>
                  </tr>
                )}

                {data?.data.map((proposal) => (
                  <tr
                    key={proposal.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {proposal.jobTitle || 'Untitled'}
                        </p>
                        {proposal.jobUrl && (
                          <a
                            href={proposal.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-500 hover:underline mt-0.5 inline-block"
                          >
                            View Job
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                      {proposal.agent?.freelanceAccount?.platform || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                      {proposal.bidAmount ? `$${proposal.bidAmount.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          statusColors[proposal.status] || statusColors.draft
                        }`}
                      >
                        {proposal.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/proposals/${proposal.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}

                {data && data.data.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500 dark:text-slate-400"
                    >
                      No proposals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Page {data.meta.page} of {data.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                  disabled={page >= data.meta.totalPages}
                  className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

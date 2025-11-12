'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';

interface DashboardStats {
  totalSurveys: number;
  totalRecords: number;
  totalIndicators: number;
  totalUsers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSurveys: 0,
    totalRecords: 0,
    totalIndicators: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [surveys, indicators, users] = await Promise.all([
          apiClient.getSurveys(),
          apiClient.getIndicators(),
          apiClient.getUsers(),
        ]);

        setStats({
          totalSurveys: surveys.data.length,
          totalRecords: surveys.data.reduce((sum: number, s: any) => sum + (s.total_records || 0), 0),
          totalIndicators: indicators.data.length,
          totalUsers: users.data.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Surveys" value={stats.totalSurveys} icon="📋" />
            <StatCard title="Total Records" value={stats.totalRecords} icon="📊" />
            <StatCard title="Total Indicators" value={stats.totalIndicators} icon="📈" />
            <StatCard title="Total Users" value={stats.totalUsers} icon="👥" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Survey uploaded</span>
                <span className="text-sm text-gray-400">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Data validated</span>
                <span className="text-sm text-gray-400">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Report generated</span>
                <span className="text-sm text-gray-400">1 day ago</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/surveys"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded text-center transition"
              >
                📋 Upload Survey
              </a>
              <a
                href="/indicators"
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded text-center transition"
              >
                📈 Compute Indicators
              </a>
              <a
                href="/reports"
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded text-center transition"
              >
                📄 Generate Report
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


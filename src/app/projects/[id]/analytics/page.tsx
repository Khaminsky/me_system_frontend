// src/app/projects/[id]/analytics/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import ChartVisualization from '@/components/analytics/ChartVisualization';
import PivotTable from '@/components/analytics/PivotTable';
import SingleValue from '@/components/analytics/SingleValue';
import { toast } from 'react-toastify';

interface Dashboard {
  id: number;
  name: string;
  description: string;
  is_default: boolean;
}

interface DashboardItem {
  id: number;
  visualization: {
    id: number;
    name: string;
    type: string;
  };
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  data: any;
}

export default function ProjectAnalyticsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboards();
  }, [projectId]);
  
  const fetchDashboards = async () => {
    try {
      const response = await apiClient.getDashboards(Number(projectId));
      setDashboards(response.data);

      // Select default dashboard or first one
      const defaultDashboard = response.data.find((d: Dashboard) => d.is_default) || response.data[0];
      if (defaultDashboard) {
        loadDashboard(defaultDashboard.id);
      }
    } catch (error) {
      console.error('Failed to fetch dashboards:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (dashboardId: number) => {
    try {
      setLoading(true);
      const response = await apiClient.getDashboardData(dashboardId);
      setSelectedDashboard(response.data.dashboard);
      setDashboardData(response.data.items);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChartClick = (clickedData: any) => {
    // Drill-down functionality - navigate to detailed view
    console.log('Chart clicked:', clickedData);

    // Example: Navigate to indicator detail page
    if (clickedData?.indicator_id) {
      // router.push(`/projects/${projectId}/indicators/${clickedData.indicator_id}`);
      toast.info(`Drill-down to: ${clickedData.name || 'Detail View'}`);
    }
  };

  const renderVisualization = (item: DashboardItem) => {
    const { type } = item.visualization;
    const { data } = item;

    switch (type) {
      case 'column_chart':
      case 'bar_chart':
      case 'line_chart':
      case 'area_chart':
      case 'pie_chart':
        return (
          <ChartVisualization
            data={data.data}
            type={type}
            options={data.options}
            onDataClick={handleChartClick}
          />
        );

      case 'pivot_table':
        return <PivotTable data={data} options={data.options} />;

      case 'single_value':
        return <SingleValue data={data.data} options={data.options} />;

      default:
        return <div>Unsupported visualization type: {type}</div>;
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Analytics</h1>
            <p className="text-gray-600 mt-1">Data visualization and insights</p>
          </div>

          <div className="flex gap-3">
            <a
              href={`/projects/${projectId}/analytics/builder`}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              🎨 Analytics Builder
            </a>

            {dashboards.length > 0 && (
              <select
                value={selectedDashboard?.id || ''}
                onChange={(e) => loadDashboard(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {dashboards.map((dashboard) => (
                  <option key={dashboard.id} value={dashboard.id}>
                    {dashboard.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : dashboards.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Dashboards Yet</h2>
            <p className="text-gray-600 mb-6">Get started by creating visualizations with our interactive builder</p>
            <a
              href={`/projects/${projectId}/analytics/builder`}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Open Analytics Builder
            </a>
          </div>
        ) : dashboardData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">This dashboard has no visualizations yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {dashboardData.map((item) => (
              <div
                key={item.id}
                className={`col-span-${item.position.w} bg-white rounded-lg shadow p-6`}
                style={{
                  gridColumn: `span ${item.position.w}`,
                }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {item.visualization.name}
                </h3>
                {renderVisualization(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
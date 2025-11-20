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
        return <SingleValue data={data} options={data.options} />;

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
          
          {/* Dashboard Selector */}
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
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading dashboard...</p>
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
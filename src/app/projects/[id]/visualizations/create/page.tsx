// src/app/projects/[id]/visualizations/create/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';
import ChartVisualization from '@/components/analytics/ChartVisualization';
import PivotTable from '@/components/analytics/PivotTable';
import SingleValue from '@/components/analytics/SingleValue';

interface Indicator {
  id: number;
  name: string;
  indicator_type: string;
  project?: number;
}

export default function CreateVisualizationPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visualization_type: 'column_chart',
    dimensions: {
      data: [] as number[],
      period: { type: 'relative', value: 'LAST_12_MONTHS' },
    },
    filters: {},
    layout: {
      rows: ['period'],
      columns: ['data'],
      filters: []
    },
    display_options: {
      show_legend: true,
      show_values: true,
      colors: ['#3b82f6', '#ef4444', '#10b981']
    }
  });

  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIndicators();
  }, [projectId]);

  const fetchIndicators = async () => {
    try {
      const response = await apiClient.getIndicators();
      // Filter by project if needed
      const allIndicators = response.data.results || response.data;
      setIndicators(allIndicators.filter((ind: Indicator) => ind.project === Number(projectId)));
    } catch (error) {
      console.error('Failed to fetch indicators:', error);
      toast.error('Failed to load indicators');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDimensionChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value
      }
    }));
  };

  const handleDisplayOptionChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      display_options: {
        ...prev.display_options,
        [field]: value
      }
    }));
  };

  const handlePreview = async () => {
    if (!formData.name) {
      toast.error('Please enter a visualization name');
      return;
    }

    if (formData.dimensions.data.length === 0) {
      toast.error('Please select at least one indicator');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.previewVisualization({
        ...formData,
        project: projectId
      });
      setPreviewData(response.data);
      toast.success('Preview generated');
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Please enter a visualization name');
      return;
    }

    if (formData.dimensions.data.length === 0) {
      toast.error('Please select at least one indicator');
      return;
    }

    try {
      setLoading(true);
      await apiClient.createVisualization({
        ...formData,
        project: projectId
      });
      toast.success('Visualization created successfully');
      router.push(`/projects/${projectId}/analytics`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to create visualization');
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (!previewData) return null;

    const { type } = previewData;

    switch (type) {
      case 'column_chart':
      case 'bar_chart':
      case 'line_chart':
      case 'area_chart':
      case 'pie_chart':
        return <ChartVisualization data={previewData.data} type={type} options={previewData.options} />;

      case 'pivot_table':
        return <PivotTable data={previewData} options={previewData.options} />;

      case 'single_value':
        return <SingleValue data={previewData.data} options={previewData.options} />;

      default:
        return <div>Unsupported visualization type</div>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Visualization</h1>
            <p className="text-gray-600 mt-1">Build custom data visualizations</p>
          </div>
          <button
            onClick={() => router.push(`/projects/${projectId}/analytics`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Analytics
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visualization Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Monthly Progress Chart"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visualization Type *
              </label>
              <select
                value={formData.visualization_type}
                onChange={(e) => handleInputChange('visualization_type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="column_chart">Column Chart</option>
                <option value="bar_chart">Bar Chart</option>
                <option value="line_chart">Line Chart</option>
                <option value="area_chart">Area Chart</option>
                <option value="pie_chart">Pie Chart</option>
                <option value="single_value">Single Value</option>
                <option value="pivot_table">Pivot Table</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe what this visualization shows..."
            />
          </div>

          {/* Data Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Indicators *
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
              {indicators.length === 0 ? (
                <p className="text-gray-500 text-sm">No indicators available for this project</p>
              ) : (
                indicators.map((indicator) => (
                  <label key={indicator.id} className="flex items-center space-x-2 py-2">
                    <input
                      type="checkbox"
                      checked={formData.dimensions.data.includes(indicator.id)}
                      onChange={(e) => {
                        const newData = e.target.checked
                          ? [...formData.dimensions.data, indicator.id]
                          : formData.dimensions.data.filter(id => id !== indicator.id);
                        handleDimensionChange('data', newData);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {indicator.name} ({indicator.indicator_type})
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={formData.dimensions.period.value}
              onChange={(e) => handleDimensionChange('period', { type: 'relative', value: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_14_DAYS">Last 14 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="LAST_3_MONTHS">Last 3 Months</option>
              <option value="LAST_6_MONTHS">Last 6 Months</option>
              <option value="LAST_12_MONTHS">Last 12 Months</option>
              <option value="THIS_YEAR">This Year</option>
              <option value="LAST_YEAR">Last Year</option>
            </select>
          </div>

          {/* Display Options */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.display_options.show_legend}
                  onChange={(e) => handleDisplayOptionChange('show_legend', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show Legend</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.display_options.show_values}
                  onChange={(e) => handleDisplayOptionChange('show_values', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show Values</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Visualization'}
          </button>
        </div>

        {/* Preview Area */}
        {previewData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
            {renderPreview()}
          </div>
        )}
      </div>
    </Layout>
  );
}
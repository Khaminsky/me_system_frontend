// src/components/analytics/AnalyticsBuilder.tsx

'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import FieldsPanel from './FieldsPanel';
import VisualizationCanvas from './VisualizationCanvas';
import VisualizationTypeSelector from './VisualizationTypeSelector';
import { apiClient } from '@/lib/api-client';

interface Indicator {
  id: number;
  name: string;
  indicator_type: string;
  data_type?: string;
}

interface Survey {
  id: number;
  name: string;
  fields: SurveyField[];
}

interface SurveyField {
  id: string;
  name: string;
  type: string;
}

interface DroppedField {
  id: string | number;
  name: string;
  type: 'indicator' | 'field';
  dataType: string;
  source?: string;
}

interface AnalyticsBuilderProps {
  projectId: number;
  indicators: Indicator[];
  surveys: Survey[];
}

export default function AnalyticsBuilder({ projectId, indicators, surveys }: AnalyticsBuilderProps) {
  const [visualizationType, setVisualizationType] = useState<string>('column_chart');
  const [xAxisFields, setXAxisFields] = useState<DroppedField[]>([]);
  const [yAxisFields, setYAxisFields] = useState<DroppedField[]>([]);
  const [filterFields, setFilterFields] = useState<DroppedField[]>([]);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const handleVisualize = async () => {
    if (yAxisFields.length === 0) {
      toast.error('Please add at least one field to Values (Y-Axis)');
      return;
    }

    // Check if we have at least one indicator
    const indicatorFields = yAxisFields.filter(f => f.type === 'indicator');
    if (indicatorFields.length === 0) {
      toast.error('Please add at least one Indicator to Values. Survey fields are not yet supported for visualization.');
      return;
    }

    try {
      setLoading(true);

      // Build visualization configuration
      const config = {
        project: projectId,
        name: 'Custom Visualization',
        description: '',
        visualization_type: visualizationType,
        dimensions: {
          data: indicatorFields.map(f => Number(f.id)),
          period: { type: 'relative', value: 'LAST_30_DAYS' },
          org_unit: [projectId]
        },
        filters: {},
        layout: {
          rows: ['period'],
          columns: ['data'],
          filters: []
        },
        display_options: {
          show_legend: true,
          show_values: true
        }
      };

      console.log('Visualization config:', config);

      // Preview the visualization
      const response = await apiClient.previewVisualization(config);
      setVisualizationData(response.data);
      toast.success('Visualization generated!');
    } catch (error: any) {
      console.error('Visualization error:', error);
      console.error('Error response:', error.response?.data);

      let errorMessage = 'Failed to generate visualization';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = 'Validation error: ' + JSON.stringify(error.response.data.details);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (yAxisFields.length === 0) {
      toast.error('Please add at least one field to Values');
      return;
    }

    // Check if we have at least one indicator
    const indicatorFields = yAxisFields.filter(f => f.type === 'indicator');
    if (indicatorFields.length === 0) {
      toast.error('Please add at least one Indicator to Values. Survey fields are not yet supported.');
      return;
    }

    const name = prompt('Enter a name for this visualization:');
    if (!name) return;

    try {
      setLoading(true);

      // Create the visualization
      const config = {
        project: projectId,
        name,
        description: '',
        visualization_type: visualizationType,
        dimensions: {
          data: indicatorFields.map(f => Number(f.id)),
          period: { type: 'relative', value: 'LAST_30_DAYS' },
          org_unit: [projectId]
        },
        filters: {},
        layout: {
          rows: ['period'],
          columns: ['data'],
          filters: []
        },
        display_options: {
          show_legend: true,
          show_values: true
        }
      };

      const vizResponse = await apiClient.createVisualization(config);
      const visualizationId = vizResponse.data.id;

      console.log('Created visualization:', visualizationId);

      // Get or create a default dashboard for this project
      let dashboardId;
      try {
        const dashboardsResponse = await apiClient.getDashboards(Number(projectId));
        const dashboards = dashboardsResponse.data;

        // Find default dashboard or first one
        const defaultDashboard = dashboards.find((d: any) => d.is_default) || dashboards[0];

        if (defaultDashboard) {
          dashboardId = defaultDashboard.id;
        } else {
          // Create a default dashboard if none exists
          const newDashboard = await apiClient.createDashboard({
            project: projectId,
            name: 'Main Dashboard',
            description: 'Default project dashboard',
            is_default: true,
            layout: { columns: 12 }
          });
          dashboardId = newDashboard.data.id;
        }
      } catch (error) {
        console.error('Error getting/creating dashboard:', error);
        // Create a default dashboard
        const newDashboard = await apiClient.createDashboard({
          project: projectId,
          name: 'Main Dashboard',
          description: 'Default project dashboard',
          is_default: true,
          layout: { columns: 12 }
        });
        dashboardId = newDashboard.data.id;
      }

      // Add visualization to dashboard
      await apiClient.addVisualizationToDashboard(dashboardId, {
        visualization: visualizationId,
        position: {
          x: 0,
          y: 0,
          w: 6,  // Half width
          h: 4   // Standard height
        }
      });

      toast.success('Visualization saved and added to dashboard!');

      // Optionally redirect to dashboard
      setTimeout(() => {
        window.location.href = `/projects/${projectId}/analytics`;
      }, 1500);

    } catch (error: any) {
      console.error('Save error:', error);
      console.error('Error response:', error.response?.data);

      let errorMessage = 'Failed to save visualization';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = 'Error: ' + JSON.stringify(error.response.data.details);
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex h-full">
      {/* Left Panel - Fields */}
      <FieldsPanel
        indicators={indicators}
        surveys={surveys}
      />
      
      {/* Main Canvas */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Visualization Type Selector */}
        <VisualizationTypeSelector
          selectedType={visualizationType}
          onTypeChange={setVisualizationType}
        />
        
        {/* Canvas */}
        <VisualizationCanvas
          visualizationType={visualizationType}
          xAxisFields={xAxisFields}
          yAxisFields={yAxisFields}
          filterFields={filterFields}
          onXAxisChange={setXAxisFields}
          onYAxisChange={setYAxisFields}
          onFilterChange={setFilterFields}
          visualizationData={visualizationData}
          loading={loading}
          onVisualize={handleVisualize}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}


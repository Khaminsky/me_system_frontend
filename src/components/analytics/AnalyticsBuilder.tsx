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
  data_type: string;
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
    
    try {
      setLoading(true);
      
      // Build visualization configuration
      const config = {
        project: projectId,
        name: 'Custom Visualization',
        visualization_type: visualizationType,
        dimensions: {
          data: yAxisFields.filter(f => f.type === 'indicator').map(f => f.id),
          period: { type: 'relative', value: 'LAST_30_DAYS' },
          org_unit: [projectId]
        },
        filters: {},
        display_options: {
          show_legend: true,
          show_values: true
        }
      };
      
      // Preview the visualization
      const response = await apiClient.previewVisualization(config);
      setVisualizationData(response.data);
      toast.success('Visualization generated!');
    } catch (error) {
      console.error('Visualization error:', error);
      toast.error('Failed to generate visualization');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (yAxisFields.length === 0) {
      toast.error('Please add at least one field to Values');
      return;
    }
    
    const name = prompt('Enter a name for this visualization:');
    if (!name) return;
    
    try {
      const config = {
        project: projectId,
        name,
        visualization_type: visualizationType,
        dimensions: {
          data: yAxisFields.filter(f => f.type === 'indicator').map(f => f.id),
          period: { type: 'relative', value: 'LAST_30_DAYS' },
          org_unit: [projectId]
        },
        filters: {},
        display_options: {
          show_legend: true,
          show_values: true
        }
      };
      
      await apiClient.createVisualization(config);
      toast.success('Visualization saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save visualization');
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


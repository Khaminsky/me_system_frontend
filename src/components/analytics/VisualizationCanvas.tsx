// src/components/analytics/VisualizationCanvas.tsx

'use client';

import DropZone from './DropZone';
import ChartVisualization from './ChartVisualization';
import PivotTable from './PivotTable';
import SingleValue from './SingleValue';

interface DroppedField {
  id: string | number;
  name: string;
  type: 'indicator' | 'field';
  dataType: string;
  source?: string;
}

interface VisualizationCanvasProps {
  visualizationType: string;
  xAxisFields: DroppedField[];
  yAxisFields: DroppedField[];
  filterFields: DroppedField[];
  onXAxisChange: (fields: DroppedField[]) => void;
  onYAxisChange: (fields: DroppedField[]) => void;
  onFilterChange: (fields: DroppedField[]) => void;
  visualizationData: any;
  loading: boolean;
  onVisualize: () => void;
  onSave: () => void;
}

export default function VisualizationCanvas({
  visualizationType,
  xAxisFields,
  yAxisFields,
  filterFields,
  onXAxisChange,
  onYAxisChange,
  onFilterChange,
  visualizationData,
  loading,
  onVisualize,
  onSave
}: VisualizationCanvasProps) {
  
  const renderVisualization = () => {
    if (!visualizationData) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium">Drag fields to create visualization</p>
            <p className="text-sm mt-2">Add fields to Values (Y-Axis) and click Visualize</p>
          </div>
        </div>
      );
    }
    
    const { type, data, options } = visualizationData;
    
    switch (type) {
      case 'column_chart':
      case 'bar_chart':
      case 'line_chart':
      case 'area_chart':
      case 'pie_chart':
        return <ChartVisualization data={data} type={type} options={options} />;
      
      case 'pivot_table':
        return <PivotTable data={visualizationData} options={options} />;
      
      case 'single_value':
        return <SingleValue data={data} options={options} />;
      
      default:
        return <div>Unsupported visualization type</div>;
    }
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Drop Zones */}
      <div className="bg-white border-b p-4">
        <div className="grid grid-cols-3 gap-4">
          <DropZone
            label="Axis (X-Axis)"
            icon="→"
            fields={xAxisFields}
            onFieldsChange={onXAxisChange}
            placeholder="Drag dimensions here"
          />
          
          <DropZone
            label="Values (Y-Axis)"
            icon="↑"
            fields={yAxisFields}
            onFieldsChange={onYAxisChange}
            placeholder="Drag measures here"
            required
          />
          
          <DropZone
            label="Filters"
            icon="🔍"
            fields={filterFields}
            onFieldsChange={onFilterChange}
            placeholder="Drag filters here"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onVisualize}
            disabled={loading || yAxisFields.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Generating...' : 'Visualize'}
          </button>
          
          <button
            onClick={onSave}
            disabled={!visualizationData || loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Save
          </button>
        </div>
      </div>
      
      {/* Visualization Area */}
      <div className="flex-1 p-6 overflow-auto bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm p-6 h-full">
          {renderVisualization()}
        </div>
      </div>
    </div>
  );
}


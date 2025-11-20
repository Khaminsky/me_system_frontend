// src/components/analytics/VisualizationTypeSelector.tsx

'use client';

interface VisualizationTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const visualizationTypes = [
  { id: 'column_chart', name: 'Column Chart', icon: '📊' },
  { id: 'bar_chart', name: 'Bar Chart', icon: '📈' },
  { id: 'line_chart', name: 'Line Chart', icon: '📉' },
  { id: 'area_chart', name: 'Area Chart', icon: '🏔️' },
  { id: 'pie_chart', name: 'Pie Chart', icon: '🥧' },
  { id: 'single_value', name: 'Single Value', icon: '🔢' },
  { id: 'pivot_table', name: 'Pivot Table', icon: '📋' },
];

export default function VisualizationTypeSelector({ selectedType, onTypeChange }: VisualizationTypeSelectorProps) {
  return (
    <div className="bg-white border-b px-6 py-3">
      <div className="flex items-center space-x-2 overflow-x-auto">
        <span className="text-sm font-medium text-gray-700 mr-2">Visualization:</span>
        {visualizationTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              selectedType === type.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{type.icon}</span>
            {type.name}
          </button>
        ))}
      </div>
    </div>
  );
}


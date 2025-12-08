// src/components/analytics/FieldsPanel.tsx

'use client';

import { useState } from 'react';

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

interface FieldsPanelProps {
  indicators: Indicator[];
  surveys: Survey[];
}

export default function FieldsPanel({ indicators, surveys }: FieldsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSurveys, setExpandedSurveys] = useState<Set<number>>(new Set());
  
  const toggleSurvey = (surveyId: number) => {
    const newExpanded = new Set(expandedSurveys);
    if (newExpanded.has(surveyId)) {
      newExpanded.delete(surveyId);
    } else {
      newExpanded.add(surveyId);
    }
    setExpandedSurveys(newExpanded);
  };
  
  const handleDragStart = (e: React.DragEvent, field: any, type: 'indicator' | 'field', source?: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      id: field.id,
      name: field.name,
      type,
      dataType: field.data_type || field.type || 'string',
      source
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  const filteredIndicators = indicators.filter(ind =>
    ind.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="w-80 bg-white border-r flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
      
      {/* Fields List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Indicators Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Indicators ({filteredIndicators.length})
          </h3>
          <div className="space-y-1">
            {filteredIndicators.map((indicator) => (
              <div
                key={indicator.id}
                draggable
                onDragStart={(e) => handleDragStart(e, indicator, 'indicator')}
                className="px-3 py-2 bg-blue-50 border border-blue-200 rounded cursor-move hover:bg-blue-100 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">{indicator.name}</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                    {indicator.indicator_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Survey Fields Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            Survey Fields ({surveys.length})
          </h3>
          <div className="space-y-2">
            {surveys.map((survey) => (
              <div key={survey.id} className="border border-gray-200 rounded">
                <button
                  onClick={() => toggleSurvey(survey.id)}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="text-sm font-medium text-gray-700">{survey.name}</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      expandedSurveys.has(survey.id) ? 'rotate-180' : ''
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {expandedSurveys.has(survey.id) && (
                  <div className="px-2 pb-2 space-y-1">
                    {Array.isArray(survey.fields) && survey.fields.length > 0 ? (
                      survey.fields.map((field) => (
                        <div
                          key={field.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, field, 'field', survey.name)}
                          className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded cursor-move hover:bg-gray-100 transition text-xs"
                        >
                          {field.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-gray-400 text-center">
                        No fields available
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


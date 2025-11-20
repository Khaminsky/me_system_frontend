// src/components/analytics/DropZone.tsx

'use client';

import { useState } from 'react';

interface DroppedField {
  id: string | number;
  name: string;
  type: 'indicator' | 'field';
  dataType: string;
  source?: string;
}

interface DropZoneProps {
  label: string;
  icon: string;
  fields: DroppedField[];
  onFieldsChange: (fields: DroppedField[]) => void;
  placeholder: string;
  required?: boolean;
}

export default function DropZone({ label, icon, fields, onFieldsChange, placeholder, required }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const fieldData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // Check if field already exists
      if (fields.some(f => f.id === fieldData.id && f.type === fieldData.type)) {
        return;
      }
      
      onFieldsChange([...fields, fieldData]);
    } catch (error) {
      console.error('Failed to parse dropped data:', error);
    }
  };
  
  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onFieldsChange(newFields);
  };
  
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
        <span className="mr-2">{icon}</span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`min-h-[100px] border-2 border-dashed rounded-lg p-3 transition ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : fields.length > 0
            ? 'border-gray-300 bg-white'
            : 'border-gray-300 bg-gray-50'
        }`}
      >
        {fields.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            {placeholder}
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={`${field.type}-${field.id}-${index}`}
                className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2 group hover:border-blue-300 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {field.name}
                  </div>
                  {field.source && (
                    <div className="text-xs text-gray-500 truncate">
                      {field.source}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleRemoveField(index)}
                  className="ml-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';

interface Survey {
  id: number;
  name: string;
}

interface SurveyField {
  name: string;
  type: 'numeric' | 'categorical';
  null_count: number;
  non_null_count: number;
  sample_values: any[];
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  unique_count?: number;
  value_counts?: Record<string, number>;
}

interface SurveyFieldsResponse {
  survey_id: number;
  survey_name: string;
  total_records: number;
  total_fields: number;
  fields: SurveyField[];
}

export default function CreateIndicatorPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<number | null>(null);
  const [surveyFields, setSurveyFields] = useState<SurveyField[]>([]);
  const [loadingFields, setLoadingFields] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [indicatorType, setIndicatorType] = useState('output');
  const [unit, setUnit] = useState('');
  const [baseline, setBaseline] = useState('');
  const [target, setTarget] = useState('');
  const [formula, setFormula] = useState('');
  const [filterCriteria, setFilterCriteria] = useState<Record<string, any>>({});
  
  // Preview state
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Helper function to check if a field is used in the formula
  const isFieldUsedInFormula = (fieldName: string): boolean => {
    if (!formula) return false;
    // Check if field name appears in formula (case-insensitive)
    return formula.toLowerCase().includes(fieldName.toLowerCase());
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await apiClient.getSurveys();
      setSurveys(response.data);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    }
  };

  const handleSurveyChange = async (surveyId: number) => {
    setSelectedSurvey(surveyId);
    setLoadingFields(true);
    setSurveyFields([]);
    
    try {
      const response = await apiClient.getSurveyFields(surveyId);
      const data: SurveyFieldsResponse = response.data;
      setSurveyFields(data.fields);
    } catch (error) {
      console.error('Failed to fetch survey fields:', error);
      toast.error('Failed to load survey fields');
    } finally {
      setLoadingFields(false);
    }
  };

  const insertField = (fieldName: string) => {
    // Insert field name directly - backend now supports spaces
    setFormula(prev => prev + fieldName);
  };

  const insertFunction = (func: string) => {
    setFormula(prev => prev + func);
  };

  const validateFormula = async () => {
    if (!formula) {
      setValidationError('Please enter a formula');
      return;
    }

    try {
      const response = await apiClient.validateFormula(formula, selectedSurvey || undefined);
      if (response.data.valid) {
        setValidationMessage(response.data.message);
        setValidationError('');
      } else {
        setValidationError(response.data.error);
        setValidationMessage('');
      }
    } catch (error: any) {
      setValidationError(error.response?.data?.error || 'Validation failed');
      setValidationMessage('');
    }
  };

  const previewIndicator = async () => {
    if (!selectedSurvey || !formula) {
      toast.warning('Please select a survey and enter a formula');
      return;
    }

    try {
      const response = await apiClient.previewIndicator(selectedSurvey, formula, filterCriteria);
      setPreviewResult(response.data.result);
    } catch (error: any) {
      toast.error('Preview failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !formula || !indicatorType || !unit) {
      toast.warning('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const data = {
        name,
        description,
        indicator_type: indicatorType,
        unit,
        baseline: baseline ? parseFloat(baseline) : null,
        target: target ? parseFloat(target) : null,
        formula,
        filter_criteria: filterCriteria,
        is_active: true
      };

      await apiClient.createIndicator(data);
      toast.success('Indicator created successfully!');
      router.push('/indicators');
    } catch (error: any) {
      toast.error('Failed to create indicator: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Create New Indicator</h1>
          <button
            onClick={() => router.push('/indicators')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Indicators
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Survey Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1. Select Data Source</h2>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Survey</label>
              <select
                value={selectedSurvey || ''}
                onChange={(e) => handleSurveyChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a survey...</option>
                {surveys.map((survey) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Field Browser & Formula Builder */}
          {selectedSurvey && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">2. Build Formula</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Field Browser */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Available Fields</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    💡 Click a field to insert it into your formula. Field names with spaces are supported.
                  </p>
                  {loadingFields ? (
                    <p className="text-gray-600">Loading fields...</p>
                  ) : surveyFields.length === 0 ? (
                    <p className="text-gray-600">No fields available. Please select a survey.</p>
                  ) : (
                    <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                      {surveyFields.map((field) => {
                        const isUsed = isFieldUsedInFormula(field.name);
                        return (
                        <div
                          key={field.name}
                          className={`p-3 border-b border-gray-200 cursor-pointer transition-colors ${
                            isUsed
                              ? 'bg-green-50 border-l-4 border-l-green-500 hover:bg-green-100'
                              : 'hover:bg-blue-50'
                          }`}
                          onClick={() => insertField(field.name)}
                          title={`Click to insert "${field.name}" into formula${isUsed ? ' (Currently used)' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800 text-sm">{field.name}</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              field.type === 'numeric'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {field.type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {field.type === 'numeric' && field.mean !== undefined && (
                              <span>Mean: {field.mean.toFixed(2)} | Range: {field.min} - {field.max}</span>
                            )}
                            {field.type === 'categorical' && (
                              <span>Unique values: {field.unique_count} | Non-null: {field.non_null_count}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Sample: {field.sample_values.slice(0, 3).map(v => String(v)).join(', ')}
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  )}
                </div>

                {/* Formula Builder */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Formula Builder</h3>

                  {/* Formula Examples */}
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 mb-1">📝 Formula Examples:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Simple count: <code className="bg-white px-1 rounded">COUNT(Name)</code></li>
                      <li>• Percentage: <code className="bg-white px-1 rounded">(COUNT(Name) / COUNT(Course Name)) * 100</code></li>
                      <li>• With spaces: <code className="bg-white px-1 rounded">COUNT(Student ID) * 100</code></li>
                    </ul>
                  </div>

                  {/* Function Buttons */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Functions:</p>
                    <div className="flex flex-wrap gap-2">
                      {['COUNT(', 'SUM(', 'AVG(', 'MIN(', 'MAX(', 'PERCENTAGE('].map((func) => (
                        <button
                          key={func}
                          type="button"
                          onClick={() => insertFunction(func)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-mono"
                          title={`Insert ${func} function`}
                        >
                          {func}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => insertFunction(')')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-mono"
                        title="Close parenthesis"
                      >
                        )
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFunction(' / ')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-mono"
                        title="Division"
                      >
                        ÷
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFunction(' * ')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-mono"
                        title="Multiplication"
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFunction(' + ')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-mono"
                        title="Addition"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFunction(' - ')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-mono"
                        title="Subtraction"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFunction(' * 100')}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
                        title="Convert to percentage"
                      >
                        × 100
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormula('')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                        title="Clear formula"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Formula Input */}
                  <div className="mb-3">
                    <label className="block text-gray-700 font-semibold mb-2">Formula *</label>
                    <textarea
                      value={formula}
                      onChange={(e) => setFormula(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={4}
                      placeholder="e.g., (COUNT(vaccinated) / COUNT(total_population)) * 100"
                      required
                    />
                  </div>

                  {/* Validation & Preview Buttons */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={validateFormula}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      Validate
                    </button>
                    <button
                      type="button"
                      onClick={previewIndicator}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Preview
                    </button>
                  </div>

                  {/* Validation Message */}
                  {validationMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                      ✓ {validationMessage}
                    </div>
                  )}
                  {validationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      ✗ {validationError}
                    </div>
                  )}

                  {/* Preview Result */}
                  {previewResult && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-semibold text-gray-700 mb-2">Preview Result:</p>
                      {previewResult.status === 'success' ? (
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{previewResult.value.toFixed(2)}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Rows processed: {previewResult.rows_processed} / {previewResult.total_rows}
                          </p>
                        </div>
                      ) : (
                        <p className="text-red-600">{previewResult.error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Indicator Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">3. Indicator Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Indicator Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Vaccination Coverage Rate"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Indicator Type *</label>
                <select
                  value={indicatorType}
                  onChange={(e) => setIndicatorType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="input">Input</option>
                  <option value="output">Output</option>
                  <option value="outcome">Outcome</option>
                  <option value="impact">Impact</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Unit of Measurement *</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., %, count, ratio"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Baseline Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={baseline}
                  onChange={(e) => setBaseline(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 45.5"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Target Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 80.0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what this indicator measures..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/indicators')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name || !formula || !indicatorType || !unit}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Indicator'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}


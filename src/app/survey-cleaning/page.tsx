'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';

interface ColumnInfo {
  name: string;
  type: string;
  non_null_count: number;
  null_count: number;
  unique_count: number;
}

interface PreviewData {
  data: any[];
  columns: ColumnInfo[];
  pagination: {
    current_page: number;
    page_size: number;
    total_rows: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export default function SurveyCleaningPage() {
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('survey');
  
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'preview' | 'columns' | 'duplicates' | 'missing' | 'transform' | 'variables'>('preview');
  
  // Column operations state
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [renameOldName, setRenameOldName] = useState('');
  const [renameNewName, setRenameNewName] = useState('');
  
  // Missing values state
  const [missingStrategy, setMissingStrategy] = useState('drop_rows');
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [fillValue, setFillValue] = useState('');
  
  // Find/Replace state
  const [findReplaceColumn, setFindReplaceColumn] = useState('');
  const [findValue, setFindValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  
  // Standardize state
  const [standardizeColumns, setStandardizeColumns] = useState<string[]>([]);
  const [standardizeOps, setStandardizeOps] = useState<string[]>([]);
  
  // Create variable state
  const [newVarName, setNewVarName] = useState('');
  const [varSourceColumns, setVarSourceColumns] = useState<string[]>([]);
  const [varOperation, setVarOperation] = useState('sum');

  useEffect(() => {
    if (surveyId) {
      loadPreviewData();
    }
  }, [surveyId, currentPage]);

  const loadPreviewData = async () => {
    if (!surveyId) return;
    try {
      setLoading(true);
      const response = await apiClient.previewSurveyData(parseInt(surveyId), currentPage, 50);
      setPreviewData(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveColumns = async () => {
    if (!surveyId || selectedColumns.length === 0) {
      toast.error('Please select columns to remove');
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.removeColumns(parseInt(surveyId), selectedColumns);
      setPreviewData(response.data.preview);
      toast.success(`Removed ${selectedColumns.length} column(s)`);
      setSelectedColumns([]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to remove columns');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = async () => {
    if (!surveyId || !newColumnName) {
      toast.error('Please enter a column name');
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.addColumn(parseInt(surveyId), newColumnName, '');
      setPreviewData(response.data.preview);
      toast.success(`Added column: ${newColumnName}`);
      setNewColumnName('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add column');
    } finally {
      setLoading(false);
    }
  };

  const handleRenameColumn = async () => {
    if (!surveyId || !renameOldName || !renameNewName) {
      toast.error('Please enter both old and new column names');
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.renameColumn(parseInt(surveyId), renameOldName, renameNewName);
      setPreviewData(response.data.preview);
      toast.success(`Renamed column: ${renameOldName} → ${renameNewName}`);
      setRenameOldName('');
      setRenameNewName('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to rename column');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!surveyId) return;
    try {
      setLoading(true);
      const response = await apiClient.removeDuplicates(parseInt(surveyId), undefined, 'first');
      setPreviewData(response.data.preview);
      toast.success(`Removed ${response.data.report.duplicates_removed} duplicate(s)`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to remove duplicates');
    } finally {
      setLoading(false);
    }
  };

  const handleMissingValues = async () => {
    if (!surveyId) return;
    try {
      setLoading(true);
      const response = await apiClient.handleMissingValues(
        parseInt(surveyId),
        missingStrategy,
        missingColumns.length > 0 ? missingColumns : undefined,
        fillValue || undefined
      );
      setPreviewData(response.data.preview);
      toast.success('Missing values handled successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to handle missing values');
    } finally {
      setLoading(false);
    }
  };

  const handleFindReplace = async () => {
    if (!surveyId || !findReplaceColumn || !findValue) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.findReplace(
        parseInt(surveyId),
        findReplaceColumn,
        findValue,
        replaceValue,
        useRegex
      );
      setPreviewData(response.data.preview);
      toast.success(`Made ${response.data.report.replacements_made} replacement(s)`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to find/replace');
    } finally {
      setLoading(false);
    }
  };

  const handleStandardize = async () => {
    if (!surveyId || standardizeColumns.length === 0 || standardizeOps.length === 0) {
      toast.error('Please select columns and operations');
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.standardizeData(parseInt(surveyId), standardizeColumns, standardizeOps);
      setPreviewData(response.data.preview);
      toast.success('Data standardized successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to standardize data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVariable = async () => {
    if (!surveyId || !newVarName || varSourceColumns.length === 0) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.createVariable(
        parseInt(surveyId),
        newVarName,
        undefined,
        varSourceColumns,
        varOperation
      );
      setPreviewData(response.data.preview);
      toast.success(`Created variable: ${newVarName}`);
      setNewVarName('');
      setVarSourceColumns([]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create variable');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCleanedData = async () => {
    if (!surveyId || !previewData) {
      toast.error('No data to save');
      return;
    }

    if (!confirm('Are you sure you want to save the cleaned data? This will replace the original data.')) {
      return;
    }

    try {
      setLoading(true);
      // We need to get all the data, not just the current page
      // For now, we'll use the preview data
      await apiClient.saveCleanedData(parseInt(surveyId), previewData.data);
      toast.success('Cleaned data saved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save cleaned data');
    } finally {
      setLoading(false);
    }
  };

  const toggleColumnSelection = (columnName: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnName)
        ? prev.filter(c => c !== columnName)
        : [...prev, columnName]
    );
  };

  const toggleStandardizeOp = (op: string) => {
    setStandardizeOps(prev =>
      prev.includes(op)
        ? prev.filter(o => o !== op)
        : [...prev, op]
    );
  };

  if (!surveyId) {
    return (
      <Layout>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Please select a survey to clean. Go to Surveys page and select a survey.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Survey Data Cleaning</h1>
          <button
            onClick={handleSaveCleanedData}
            disabled={loading || !previewData}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save Cleaned Data
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'preview', label: 'Data Preview' },
              { id: 'columns', label: 'Column Operations' },
              { id: 'duplicates', label: 'Remove Duplicates' },
              { id: 'missing', label: 'Missing Values' },
              { id: 'transform', label: 'Transform Data' },
              { id: 'variables', label: 'Create Variables' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-600">Processing...</p>
              </div>
            )}

            {/* Data Preview Tab */}
            {activeTab === 'preview' && previewData && !loading && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Data Preview</h2>
                  <div className="text-sm text-gray-600">
                    Showing {previewData.data.length} of {previewData.pagination.total_rows} rows
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {previewData.columns.map((col) => (
                          <th key={col.name} className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                            {col.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          {previewData.columns.map((col) => (
                            <td key={col.name} className="px-4 py-2 text-sm text-gray-700">
                              {row[col.name] !== null && row[col.name] !== undefined
                                ? String(row[col.name])
                                : <span className="text-gray-400 italic">null</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                
                {/* Column Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Column Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewData.columns.map((col) => (
                      <div key={col.name} className="bg-white p-3 rounded border border-gray-200">
                        <p className="font-medium text-gray-800 truncate" title={col.name}>{col.name}</p>
                        <p className="text-xs text-gray-500">{col.type}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Non-null: {col.non_null_count} | Null: {col.null_count}
                        </p>
                        <p className="text-xs text-gray-600">Unique: {col.unique_count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                

                {/* Pagination */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={!previewData.pagination.has_previous}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {previewData.pagination.current_page} of {previewData.pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!previewData.pagination.has_next}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Column Operations Tab */}
            {activeTab === 'columns' && previewData && !loading && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Column Operations</h2>

                {/* Remove Columns */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3">Remove Columns</h3>
                  <div className="space-y-2 mb-4">
                    {previewData.columns.map((col) => (
                      <label key={col.name} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(col.name)}
                          onChange={() => toggleColumnSelection(col.name)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-gray-700">{col.name}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={handleRemoveColumns}
                    disabled={selectedColumns.length === 0}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                  >
                    Remove Selected Columns
                  </button>
                </div>

                {/* Add Column */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3">Add Column</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="New column name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    />
                    <button
                      onClick={handleAddColumn}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add Column
                    </button>
                  </div>
                </div>

                {/* Rename Column */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3">Rename Column</h3>
                  <div className="flex gap-2">
                    <select
                      value={renameOldName}
                      onChange={(e) => setRenameOldName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Select column to rename</option>
                      {previewData.columns.map((col) => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={renameNewName}
                      onChange={(e) => setRenameNewName(e.target.value)}
                      placeholder="New name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    />
                    <button
                      onClick={handleRenameColumn}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Rename
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Remove Duplicates Tab */}
            {activeTab === 'duplicates' && previewData && !loading && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Remove Duplicate Rows</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    This will remove duplicate rows from your dataset, keeping only the first occurrence of each unique row.
                  </p>
                  <button
                    onClick={handleRemoveDuplicates}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                  >
                    Remove Duplicates
                  </button>
                </div>
              </div>
            )}

            {/* Missing Values Tab */}
            {activeTab === 'missing' && previewData && !loading && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Handle Missing Values</h2>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Strategy</label>
                    <select
                      value={missingStrategy}
                      onChange={(e) => setMissingStrategy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="drop_rows">Drop rows with missing values</option>
                      <option value="drop_columns">Drop columns with missing values</option>
                      <option value="fill_mean">Fill with mean (numeric columns)</option>
                      <option value="fill_median">Fill with median (numeric columns)</option>
                      <option value="fill_mode">Fill with mode (most frequent value)</option>
                      <option value="fill_value">Fill with custom value</option>
                      <option value="forward_fill">Forward fill</option>
                      <option value="backward_fill">Backward fill</option>
                    </select>
                  </div>

                  {missingStrategy === 'fill_value' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fill Value</label>
                      <input
                        type="text"
                        value={fillValue}
                        onChange={(e) => setFillValue(e.target.value)}
                        placeholder="Enter value to fill"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleMissingValues}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Apply Strategy
                  </button>
                </div>
              </div>
            )}

            {/* Transform Data Tab */}
            {activeTab === 'transform' && previewData && !loading && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Transform Data</h2>

                {/* Find and Replace */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold text-gray-700">Find and Replace</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Column</label>
                      <select
                        value={findReplaceColumn}
                        onChange={(e) => setFindReplaceColumn(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="">Select column</option>
                        {previewData.columns.map((col) => (
                          <option key={col.name} value={col.name}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Find Value</label>
                      <input
                        type="text"
                        value={findValue}
                        onChange={(e) => setFindValue(e.target.value)}
                        placeholder="Value to find"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Replace With</label>
                      <input
                        type="text"
                        value={replaceValue}
                        onChange={(e) => setReplaceValue(e.target.value)}
                        placeholder="Replacement value"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={useRegex}
                          onChange={(e) => setUseRegex(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Use Regex</span>
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={handleFindReplace}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Find and Replace
                  </button>
                </div>

                {/* Standardize Data */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold text-gray-700">Standardize Data</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Columns</label>
                    <div className="space-y-2 mb-4">
                      {previewData.columns.map((col) => (
                        <label key={col.name} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={standardizeColumns.includes(col.name)}
                            onChange={() => {
                              setStandardizeColumns(prev =>
                                prev.includes(col.name)
                                  ? prev.filter(c => c !== col.name)
                                  : [...prev, col.name]
                              );
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-gray-700">{col.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Operations</label>
                    <div className="space-y-2">
                      {['trim', 'lowercase', 'uppercase', 'title_case', 'remove_special_chars'].map((op) => (
                        <label key={op} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={standardizeOps.includes(op)}
                            onChange={() => toggleStandardizeOp(op)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-gray-700">{op.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleStandardize}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Standardize
                  </button>
                </div>
              </div>
            )}

            {/* Create Variables Tab */}
            {activeTab === 'variables' && previewData && !loading && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Create New Variables</h2>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Variable Name</label>
                    <input
                      type="text"
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      placeholder="Enter new variable name"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source Columns</label>
                    <div className="space-y-2 mb-4">
                      {previewData.columns.map((col) => (
                        <label key={col.name} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={varSourceColumns.includes(col.name)}
                            onChange={() => {
                              setVarSourceColumns(prev =>
                                prev.includes(col.name)
                                  ? prev.filter(c => c !== col.name)
                                  : [...prev, col.name]
                              );
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-gray-700">{col.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Operation</label>
                    <select
                      value={varOperation}
                      onChange={(e) => setVarOperation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="sum">Sum</option>
                      <option value="mean">Mean (Average)</option>
                      <option value="concat">Concatenate</option>
                      <option value="multiply">Multiply</option>
                    </select>
                  </div>

                  <button
                    onClick={handleCreateVariable}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Create Variable
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

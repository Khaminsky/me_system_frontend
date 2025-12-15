'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

interface Survey {
  id: number;
  name: string;
}

interface ReportSummary {
  total_records: number;
  total_columns: number;
  columns: string[];
  top_values: Record<string, any>;
}

export default function ReportsPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<number | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Pagination and search for surveys
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    searchQuery,
    paginatedItems,
    filteredItems,
    setCurrentPage,
    setItemsPerPage,
    setSearchQuery
  } = usePagination({
    items: surveys,
    itemsPerPage: 9, // 3x3 grid
    searchFields: ['name']
  });

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await apiClient.getSurveys();
      setSurveys(response.data);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveySelect = async (surveyId: number) => {
    setSelectedSurvey(surveyId);
    try {
      const response = await apiClient.generateReport(surveyId);
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      toast.error('Failed to load report summary');
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    if (!selectedSurvey) return;
    try {
      setExporting(true);
      const response = await apiClient.exportReport(selectedSurvey, format);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Report exported successfully!');
    } catch (error: any) {
      toast.error('Failed to export report: ' + (error.response?.data?.detail || error.message));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

        {/* Survey Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-800">Select Survey</h2>
            <div className="w-full sm:w-96">
              <SearchBar
                placeholder="Search surveys..."
                onSearch={setSearchQuery}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading surveys...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-gray-600">
              {searchQuery ? `No surveys found matching "${searchQuery}"` : 'No surveys available'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {paginatedItems.map((survey) => (
                  <button
                    key={survey.id}
                    onClick={() => handleSurveySelect(survey.id)}
                    className={`p-4 rounded-lg border-2 transition text-left ${
                      selectedSurvey === survey.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-800">{survey.name}</p>
                    <p className="text-sm text-gray-600">Click to view report</p>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredItems.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Report Summary */}
        {summary && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Records</p>
                <p className="text-3xl font-bold text-gray-800">{summary.total_records}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Columns</p>
                <p className="text-3xl font-bold text-gray-800">{summary.total_columns}</p>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Export Report</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
                >
                  📥 Export as CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  disabled={exporting}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
                >
                  📥 Export as Excel
                </button>
                <button
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
                >
                  📥 Export as JSON
                </button>
              </div>
            </div>

            {/* Columns Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Columns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {summary.columns.map((column, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-700">{column}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Values */}
            {Object.keys(summary.top_values).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Top Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(summary.top_values).map(([column, values]: [string, any]) => (
                    <div key={column}>
                      <h3 className="font-semibold text-gray-800 mb-2">{column}</h3>
                      <ul className="space-y-1">
                        {Object.entries(values).slice(0, 5).map(([value, count]: [string, any]) => (
                          <li key={value} className="flex justify-between text-sm text-gray-600">
                            <span>{value}</span>
                            <span className="font-semibold">{count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}


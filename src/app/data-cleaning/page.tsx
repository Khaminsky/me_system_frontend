'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MissingValueData {
  missing_count: number;
  missing_percentage: number;
  non_null_count: number;
}

interface UniqueNullData {
  unique_count: number;
  null_count: number;
  null_percentage: number;
}

interface ValidationReport {
  summary: {
    total_rows: number;
    total_columns: number;
    total_cells: number;
    missing_cells: number;
    quality_score: number;
    quality_status: string;
  };
  missing_values: Record<string, MissingValueData>;
  data_types: Record<string, any>;
  unique_and_null: Record<string, UniqueNullData>;
  problematic_columns: string[];
  recommendations: string[];
}

export default function DataCleaningPage() {
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('survey');
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (surveyId) {
      validateData();
    }
  }, [surveyId]);

  const validateData = async () => {
    if (!surveyId) return;
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.validateData(parseInt(surveyId));
      setReport(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to validate data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = report
    ? Object.entries(report.missing_values).map(([column, data]) => ({
        column: column.substring(0, 15),
        missing: data.missing_count,
        unique: report.unique_and_null[column]?.unique_count || 0,
      }))
    : [];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Data Validation</h1>

        {!surveyId && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Please select a survey to validate. Go to Surveys page and click Validate.
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Validating data...</p>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Total Records</p>
                <p className="text-2xl font-bold text-gray-800">{report.summary.total_rows}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Total Columns</p>
                <p className="text-2xl font-bold text-gray-800">{report.summary.total_columns}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Missing Cells</p>
                <p className="text-2xl font-bold text-red-600">
                  {report.summary.missing_cells}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Quality Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {report.summary.quality_score}%
                </p>
                <p className="text-xs text-gray-500 mt-1">{report.summary.quality_status}</p>
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Data Quality by Column</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="column" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="missing" fill="#ef4444" name="Missing Values" />
                    <Bar dataKey="unique" fill="#3b82f6" name="Unique Values" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Detailed Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Missing Values */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Missing Values by Column</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(report.missing_values).map(([column, data]) => (
                    <div key={column} className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">{column}</span>
                      <div className="text-right">
                        <span className="font-semibold text-red-600">{data.missing_count}</span>
                        <span className="text-xs text-gray-500 ml-2">({data.missing_percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Problematic Columns */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Problematic Columns</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {report.problematic_columns.length > 0 ? (
                    report.problematic_columns.map((column) => (
                      <div key={column} className="py-2 border-b">
                        <span className="text-gray-700">{column}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No problematic columns detected</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recommendations</h2>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}


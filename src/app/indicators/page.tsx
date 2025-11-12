'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { useForm } from 'react-hook-form';

interface Indicator {
  id: number;
  name: string;
  formula: string;
  filter_criteria: string;
  project: string;
}

interface Survey {
  id: number;
  name: string;
}

export default function IndicatorsPage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { register, handleSubmit, watch } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [indicatorsRes, surveysRes] = await Promise.all([
        apiClient.getIndicators(),
        apiClient.getSurveys(),
      ]);
      setIndicators(indicatorsRes.data);
      setSurveys(surveysRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setComputing(true);
      const response = await apiClient.computeIndicators(parseInt(data.survey_id));
      setResults(response.data);
    } catch (error: any) {
      alert('Failed to compute indicators: ' + (error.response?.data?.detail || error.message));
    } finally {
      setComputing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Indicators</h1>

        {/* Compute Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Compute Indicators</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Select Survey</label>
                <select
                  {...register('survey_id', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a survey...</option>
                  {surveys.map((survey) => (
                    <option key={survey.id} value={survey.id}>
                      {survey.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={computing}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
            >
              {computing ? 'Computing...' : 'Compute Indicators'}
            </button>
          </form>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Computation Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(results).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-700 font-semibold text-sm">{key}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Indicators List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Available Indicators</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading indicators...</div>
          ) : indicators.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No indicators defined yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Formula</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Filter Criteria</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Project</th>
                  </tr>
                </thead>
                <tbody>
                  {indicators.map((indicator) => (
                    <tr key={indicator.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{indicator.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{indicator.formula}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{indicator.filter_criteria || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{indicator.project}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


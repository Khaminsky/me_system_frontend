'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';

interface Survey {
  id: number;
  name: string;
  description: string;
  uploaded_by: number;
  uploaded_by_username: string;
  upload_date: string;
  file: string;
  total_records: number;
  cleaned_records: number;
  cleaned_file: string | null;
  cleaned: boolean;
  cleaned_date: string | null;
  cleaned_by: number | null;
  cleaned_by_username: string | null;
  is_archived: boolean;
  archived_date: string | null;
  archived_by: number | null;
  archived_by_username: string | null;
}

export default function SurveyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSurvey(parseInt(surveyId));
      setSurvey(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch survey details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading survey details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !survey) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Survey not found'}
          </div>
          <button
            onClick={() => router.push('/surveys')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Back to Surveys
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{survey.name}</h1>
            <p className="text-gray-600 mt-2">{survey.description}</p>
          </div>
          <button
            onClick={() => router.push('/surveys')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Back to List
          </button>
        </div>

        {/* Survey Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Survey Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Survey ID</p>
              <p className="text-lg font-semibold text-gray-800">{survey.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-lg font-semibold text-gray-800">{survey.total_records}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Uploaded By</p>
              <p className="text-lg font-semibold text-gray-800">{survey.uploaded_by_username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Upload Date</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(survey.upload_date).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Original File</p>
              <a
                href={`http://localhost:8000${survey.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-500 hover:text-blue-700"
              >
                Download
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-800">
                {survey.is_archived ? (
                  <span className="text-red-600">Archived</span>
                ) : (
                  <span className="text-green-600">Active</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Cleaning Information */}
        {survey.cleaned && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Data Cleaning Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cleaned Records</p>
                <p className="text-lg font-semibold text-gray-800">{survey.cleaned_records}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cleaned By</p>
                <p className="text-lg font-semibold text-gray-800">
                  {survey.cleaned_by_username || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cleaned Date</p>
                <p className="text-lg font-semibold text-gray-800">
                  {survey.cleaned_date ? new Date(survey.cleaned_date).toLocaleString() : 'N/A'}
                </p>
              </div>
              {survey.cleaned_file && (
                <div>
                  <p className="text-sm text-gray-600">Cleaned File</p>
                  <a
                    href={`http://localhost:8000${survey.cleaned_file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-blue-500 hover:text-blue-700"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push(`/data-cleaning?survey=${survey.id}`)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Validate Data
            </button>
            <button
              onClick={() => router.push(`/indicators?survey=${survey.id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Compute Indicators
            </button>
            <button
              onClick={() => router.push(`/reports?survey=${survey.id}`)}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* Archive Information */}
        {survey.is_archived && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-6">
            <h2 className="text-xl font-bold text-yellow-800 mb-4">Archive Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-yellow-700">Archived By</p>
                <p className="text-lg font-semibold text-yellow-900">
                  {survey.archived_by_username || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-yellow-700">Archived Date</p>
                <p className="text-lg font-semibold text-yellow-900">
                  {survey.archived_date ? new Date(survey.archived_date).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}


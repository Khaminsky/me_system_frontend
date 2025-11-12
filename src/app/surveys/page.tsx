'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { useForm } from 'react-hook-form';

interface Survey {
  id: number;
  name: string;
  description: string;
  total_records: number;
  upload_date: string;
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

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

  const onSubmit = async (data: any) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('file', data.file[0]);

      await apiClient.uploadSurvey(formData);
      reset();
      fetchSurveys();
      alert('Survey uploaded successfully!');
    } catch (error: any) {
      alert('Failed to upload survey: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Surveys</h1>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upload New Survey</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Survey Name</label>
                <input
                  type="text"
                  {...register('name', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter survey name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <input
                  type="text"
                  {...register('description')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Select File</label>
              <input
                type="file"
                {...register('file', { required: true })}
                accept=".csv,.xlsx,.xls"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Supported formats: CSV, Excel</p>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Survey'}
            </button>
          </form>
        </div>

        {/* Surveys List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Uploaded Surveys</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading surveys...</div>
          ) : surveys.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No surveys uploaded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Records</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Upload Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((survey) => (
                    <tr key={survey.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{survey.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{survey.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{survey.total_records}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(survey.upload_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <a href={`/surveys/${survey.id}`} className="text-blue-500 hover:text-blue-700">
                          View
                        </a>
                        <a href={`/data-cleaning?survey=${survey.id}`} className="text-green-500 hover:text-green-700">
                          Validate
                        </a>
                      </td>
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


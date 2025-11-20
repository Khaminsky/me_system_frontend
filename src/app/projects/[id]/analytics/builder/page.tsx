// src/app/projects/[id]/analytics/builder/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';
import AnalyticsBuilder from '@/components/analytics/AnalyticsBuilder';

interface Indicator {
  id: number;
  name: string;
  indicator_type: string;
  data_type: string;
  project?: number;
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

export default function AnalyticsBuilderPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, [projectId]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch indicators
      const indicatorsResponse = await apiClient.getIndicators();
      const allIndicators = indicatorsResponse.data.results || indicatorsResponse.data;
      setIndicators(allIndicators.filter((ind: Indicator) => ind.project === Number(projectId)));
      
      // Fetch surveys with fields
      const surveysResponse = await apiClient.getProjectSurveys(Number(projectId));
      const projectSurveys = surveysResponse.data.results || surveysResponse.data;
      
      // Fetch fields for each survey
      const surveysWithFields = await Promise.all(
        projectSurveys.map(async (survey: Survey) => {
          try {
            const fieldsResponse = await apiClient.getSurveyFields(survey.id);
            return {
              ...survey,
              fields: fieldsResponse.data || []
            };
          } catch (error) {
            console.error(`Failed to fetch fields for survey ${survey.id}:`, error);
            return { ...survey, fields: [] };
          }
        })
      );
      
      setSurveys(surveysWithFields);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics builder...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Builder</h1>
              <p className="text-sm text-gray-600 mt-1">Drag and drop to create visualizations</p>
            </div>
            <a
              href={`/projects/${projectId}/analytics`}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
            >
              ← Back to Dashboards
            </a>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <AnalyticsBuilder
            projectId={Number(projectId)}
            indicators={indicators}
            surveys={surveys}
          />
        </div>
      </div>
    </Layout>
  );
}


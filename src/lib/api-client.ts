import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.client.post('/users/auth/login/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response;
  }

  async register(username: string, email: string, password: string) {
    return this.client.post('/users/auth/register/', { username, email, password });
  }

  async getProfile() {
    return this.client.get('/users/auth/profile/');
  }

  // Survey endpoints
  async getSurveys() {
    return this.client.get('/surveys/');
  }

  async getSurvey(id: number) {
    return this.client.get(`/surveys/${id}/`);
  }

  async getSurveyFields(id: number) {
    return this.client.get(`/surveys/${id}/fields/`);
  }

  async uploadSurvey(formData: FormData) {
    return this.client.post('/surveys/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async processSheets(surveyId: number, sheetNames: string[]) {
    return this.client.post(`/surveys/${surveyId}/process-sheet/`, {
      sheet_names: sheetNames,
    });
  }

  async updateSurvey(surveyId: number, data: FormData) {
    return this.client.patch(`/surveys/${surveyId}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteSurvey(surveyId: number) {
    return this.client.delete(`/surveys/${surveyId}/`);
  }

  async restoreSurvey(surveyId: number) {
    return this.client.post(`/surveys/${surveyId}/restore/`);
  }

  async getArchivedSurveys() {
    return this.client.get('/surveys/archived/');
  }

  // Data Cleaning endpoints
  async validateData(surveyId: number) {
    return this.client.get(`/data-cleaning/validate/${surveyId}/`);
  }

  // Indicators endpoints
  async getIndicators() {
    return this.client.get('/indicators/');
  }

  async getIndicator(id: number) {
    return this.client.get(`/indicators/${id}/`);
  }

  async computeIndicators(surveyId: number, indicatorIds: number[]) {
    return this.client.post(`/indicators/compute/${surveyId}/`, {
      indicator_ids: indicatorIds
    });
  }

  async createIndicator(data: any) {
    return this.client.post('/indicators/', data);
  }

  async updateIndicator(indicatorId: number, data: any) {
    return this.client.patch(`/indicators/${indicatorId}/`, data);
  }

  async deleteIndicator(indicatorId: number) {
    return this.client.delete(`/indicators/${indicatorId}/`);
  }

  async validateFormula(formula: string, surveyId?: number) {
    return this.client.post('/indicators/validate-formula/', {
      formula,
      survey_id: surveyId
    });
  }

  async previewIndicator(surveyId: number, formula: string, filterCriteria?: Record<string, any>) {
    return this.client.post('/indicators/preview/', {
      survey_id: surveyId,
      formula,
      filter_criteria: filterCriteria || {}
    });
  }

  // Reports endpoints
  async generateReport(surveyId: number) {
    return this.client.get(`/reports/summary/${surveyId}/`);
  }

  async exportReport(surveyId: number, format: 'csv' | 'excel' | 'json') {
    return this.client.get(`/reports/export/${surveyId}/`, {
      params: { format },
      responseType: 'blob',
    });
  }

  // Users endpoints
  async getUsers() {
    return this.client.get('/users/');
  }

  async getUser(id: number) {
    return this.client.get(`/users/${id}/`);
  }

  async createUser(data: any) {
    return this.client.post('/users/', data);
  }

  async updateUser(id: number, data: any) {
    return this.client.patch(`/users/${id}/`, data);
  }

  async deleteUser(id: number) {
    return this.client.delete(`/users/${id}/`);
  }
}

export const apiClient = new APIClient();


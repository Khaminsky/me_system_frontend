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

  // Project endpoints
  async getProjects() {
    return this.client.get('/projects/');
  }

  async getProject(id: number) {
    return this.client.get(`/projects/${id}/`);
  }

  async createProject(data: { name: string; description?: string }) {
    return this.client.post('/projects/', data);
  }

  async updateProject(id: number, data: { name?: string; description?: string }) {
    return this.client.patch(`/projects/${id}/`, data);
  }

  async deleteProject(id: number) {
    return this.client.delete(`/projects/${id}/`);
  }

  async restoreProject(id: number) {
    return this.client.post(`/projects/${id}/restore/`);
  }

  async getArchivedProjects() {
    return this.client.get('/projects/archived/');
  }

  async getProjectSurveys(id: number) {
    return this.client.get(`/projects/${id}/surveys/`);
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

  async previewSurveyData(surveyId: number, page: number = 1, pageSize: number = 50) {
    return this.client.get(`/data-cleaning/preview/${surveyId}/`, {
      params: { page, page_size: pageSize }
    });
  }

  async removeColumns(surveyId: number, columns: string[]) {
    return this.client.post(`/data-cleaning/clean/${surveyId}/remove-columns/`, { columns });
  }

  async addColumn(surveyId: number, columnName: string, defaultValue: any = null) {
    return this.client.post(`/data-cleaning/clean/${surveyId}/add-column/`, {
      column_name: columnName,
      default_value: defaultValue
    });
  }

  async renameColumn(surveyId: number, oldName: string, newName: string) {
    return this.client.post(`/data-cleaning/clean/${surveyId}/rename-column/`, {
      old_name: oldName,
      new_name: newName
    });
  }

  async removeDuplicates(surveyId: number, subset?: string[], keep: string = 'first') {
    return this.client.post(`/data-cleaning/clean/${surveyId}/remove-duplicates/`, {
      subset,
      keep
    });
  }

  async handleMissingValues(
    surveyId: number,
    strategy: string,
    columns?: string[],
    fillValue?: any
  ) {
    return this.client.post(`/data-cleaning/clean/${surveyId}/handle-missing/`, {
      strategy,
      columns,
      fill_value: fillValue
    });
  }

  async findReplace(
    surveyId: number,
    column: string,
    findValue: any,
    replaceValue: any,
    useRegex: boolean = false
  ) {
    return this.client.post(`/data-cleaning/clean/${surveyId}/find-replace/`, {
      column,
      find_value: findValue,
      replace_value: replaceValue,
      use_regex: useRegex
    });
  }

  async standardizeData(surveyId: number, columns: string[], operations: string[]) {
    return this.client.post(`/data-cleaning/clean/${surveyId}/standardize/`, {
      columns,
      operations
    });
  }

  async createVariable(
    surveyId: number,
    newColumn: string,
    expression?: string,
    sourceColumns?: string[],
    operation?: string
  ) {
    return this.client.post(`/data-cleaning/clean/${surveyId}/create-variable/`, {
      new_column: newColumn,
      expression,
      source_columns: sourceColumns,
      operation
    });
  }

  async saveCleanedData(surveyId: number, cleanedData: any[]) {
    return this.client.post(`/data-cleaning/clean/${surveyId}/save-cleaned/`, {
      cleaned_data: cleanedData
    });
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

  // Repository/Document endpoints
  async getDocuments(params?: {
    project?: number;
    document_type?: string;
    category?: number;
    include_archived?: boolean;
    tags?: string;
  }) {
    return this.client.get('/repository/documents/', { params });
  }

  async getDocument(id: number) {
    return this.client.get(`/repository/documents/${id}/`);
  }

  async uploadDocument(formData: FormData) {
    return this.client.post('/repository/documents/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async createDocument(data: {
    title: string;
    description?: string;
    document_type: string;
    project: number;
    category?: number;
    file: File;
    is_public?: boolean;
    tags?: string;
  }) {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('document_type', data.document_type);
    formData.append('project', data.project.toString());
    if (data.category) formData.append('category', data.category.toString());
    formData.append('file', data.file);
    if (data.is_public !== undefined) formData.append('is_public', data.is_public.toString());
    if (data.tags) formData.append('tags', data.tags);

    return this.uploadDocument(formData);
  }

  async updateDocument(id: number, data: Partial<{
    title: string;
    description: string;
    document_type: string;
    category: number;
    is_public: boolean;
    tags: string;
  }>) {
    return this.client.patch(`/repository/documents/${id}/`, data);
  }

  async deleteDocument(id: number) {
    return this.client.delete(`/repository/documents/${id}/`);
  }

  async archiveDocument(id: number) {
    return this.client.post(`/repository/documents/${id}/archive/`);
  }

  async unarchiveDocument(id: number) {
    return this.client.post(`/repository/documents/${id}/unarchive/`);
  }

  async downloadDocument(id: number) {
    return this.client.get(`/repository/documents/${id}/download/`);
  }

  async getDocumentStatistics() {
    return this.client.get('/repository/documents/statistics/');
  }

  async getRecentDocuments(limit: number = 10) {
    return this.client.get('/repository/documents/recent/', {
      params: { limit }
    });
  }

  // Document Categories
  async getDocumentCategories() {
    return this.client.get('/repository/categories/');
  }

  async getDocumentCategory(id: number) {
    return this.client.get(`/repository/categories/${id}/`);
  }

  async createDocumentCategory(data: { name: string; description?: string }) {
    return this.client.post('/repository/categories/', data);
  }

  async updateDocumentCategory(id: number, data: { name?: string; description?: string }) {
    return this.client.patch(`/repository/categories/${id}/`, data);
  }

  async deleteDocumentCategory(id: number) {
    return this.client.delete(`/repository/categories/${id}/`);
  }

  // Document Access Logs
  async getDocumentAccessLogs(params?: { document?: number; user?: number }) {
    return this.client.get('/repository/access-logs/', { params });
  }

  // System Settings endpoints
  async getSystemSettings() {
    return this.client.get('/settings/');
  }

  async getPublicSystemSettings() {
    return this.client.get('/settings/public/');
  }

  async updateSystemSettings(data: FormData | any) {
    const config = data instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return this.client.patch('/settings/', data, config);
  }

  // Analytics endpoints
  async getVisualizations(projectId: number) {
    return this.client.get(`/analytics/visualizations/?project=${projectId}`);
  }

  async getVisualization(id: number) {
    return this.client.get(`/analytics/visualizations/${id}/`);
  }

  async createVisualization(data: any) {
    return this.client.post('/analytics/visualizations/', data);
  }

  async updateVisualization(id: number, data: any) {
    return this.client.patch(`/analytics/visualizations/${id}/`, data);
  }

  async deleteVisualization(id: number) {
    return this.client.delete(`/analytics/visualizations/${id}/`);
  }

  async evaluateVisualization(id: number) {
    return this.client.get(`/analytics/visualizations/${id}/evaluate/`);
  }

  async previewVisualization(data: any) {
    return this.client.post('/analytics/visualizations/preview/', data);
  }

  async exportVisualization(id: number, format: 'csv' | 'excel') {
    return this.client.get(`/analytics/visualizations/${id}/export/?format=${format}`, {
      responseType: 'blob'
    });
  }

  async getDashboards(projectId: number) {
    return this.client.get(`/analytics/dashboards/?project=${projectId}`);
  }

  async getDashboard(id: number) {
    return this.client.get(`/analytics/dashboards/${id}/`);
  }

  async createDashboard(data: any) {
    return this.client.post('/analytics/dashboards/', data);
  }

  async updateDashboard(id: number, data: any) {
    return this.client.patch(`/analytics/dashboards/${id}/`, data);
  }

  async deleteDashboard(id: number) {
    return this.client.delete(`/analytics/dashboards/${id}/`);
  }

  async getDashboardData(id: number) {
    return this.client.get(`/analytics/dashboards/${id}/data/`);
  }

  async addVisualizationToDashboard(dashboardId: number, data: any) {
    return this.client.post(`/analytics/dashboards/${dashboardId}/add_visualization/`, data);
  }

  async removeVisualizationFromDashboard(dashboardId: number, itemId: number) {
    return this.client.delete(`/analytics/dashboards/${dashboardId}/items/${itemId}/`);
  }

  async getProjectAnalytics(projectId: number) {
    return this.client.get(`/analytics/projects/${projectId}/analytics/`);
  }
}

export const apiClient = new APIClient();


'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import ConfirmDialog from '@/components/ConfirmDialog';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import SortableTableHeader from '@/components/SortableTableHeader';
import { usePagination } from '@/hooks/usePagination';

interface Survey {
  id: number;
  name: string;
  description: string;
  total_records: number;
  upload_date: string;
  project: number;
  project_name: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
}

interface FilterState {
  status: string;
  dateRange: string;
  source: string;
}

// Action Menu Component
function ActionMenu({ surveyId, surveyName, onDelete, onEdit }: { surveyId: number; surveyName: string; onDelete: () => void; onEdit: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 200; // Approximate height of the menu (4 items)
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Position menu above if not enough space below
      const shouldPositionAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;

      setMenuPosition({
        top: shouldPositionAbove ? rect.top - menuHeight - 8 : rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
        title="Actions"
      >
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
            style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  window.location.href = `/surveys/${surveyId}`;
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onEdit();
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>

              <button
                onClick={() => {
                  window.location.href = `/survey-cleaning?survey=${surveyId}`;
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Clean Data
              </button>

              <button
                onClick={() => {
                  // Download functionality
                  setIsOpen(false);
                  toast.info('Download functionality coming soon!');
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>

              <div className="border-t border-gray-200 my-1" />

              <button
                onClick={() => {
                  setIsOpen(false);
                  onDelete();
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SurveysContent() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [sheetSelection, setSheetSelection] = useState<{
    surveyId: number;
    sheetNames: string[];
  } | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    dateRange: 'all',
    source: 'all'
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    surveyId: number | null;
    surveyName: string;
  }>({ isOpen: false, surveyId: null, surveyName: '' });

  interface SurveyFormData {
    name: string;
    description: string;
    file: FileList;
    project_id: string;
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SurveyFormData>();

  // Pagination and search
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    searchQuery,
    paginatedItems,
    filteredItems,
    sortField,
    sortDirection,
    setCurrentPage,
    setItemsPerPage,
    setSearchQuery,
    setSorting
  } = usePagination({
    items: surveys,
    itemsPerPage: 10,
    searchFields: ['name', 'upload_date'],
    defaultSortField: 'name',
    defaultSortDirection: 'asc'
  });

  // Get project filter from URL query parameter
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get('project');

  useEffect(() => {
    fetchSurveys();
    fetchProjects();
  }, [projectFilter]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);

      // If project filter is present, fetch surveys for that project only
      let response;
      if (projectFilter) {
        response = await apiClient.getProjectSurveys(Number(projectFilter));
        console.log(`Surveys for project ${projectFilter}:`, response.data);
      } else {
        response = await apiClient.getSurveys();
        console.log('All surveys:', response.data);
      }

      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      toast.error('Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await apiClient.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const onSubmit = async (data: SurveyFormData) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('project_id', data.project_id);
      formData.append('file', data.file[0]);

      const response = await apiClient.uploadSurvey(formData);

      if (response.data.sheets && response.data.sheets.length > 0) {
        setSheetSelection({
          surveyId: response.data.survey_id,
          sheetNames: response.data.sheets
        });
        setSelectedSheets(response.data.sheets);
      } else {
        reset();
        setShowAddPanel(false);
        fetchSurveys();
        toast.success('Survey uploaded successfully!');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; detail?: string }; }; message?: string };
      toast.error('Failed to upload survey: ' + (err.response?.data?.error || err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSheetSelection = async () => {
    if (!sheetSelection) return;

    try {
      setUploading(true);
      await apiClient.processSheets(sheetSelection.surveyId, selectedSheets);
      setSheetSelection(null);
      setSelectedSheets([]);
      reset();
      setShowAddPanel(false);
      fetchSurveys();
      toast.success(`Successfully imported ${selectedSheets.length} sheet(s)!`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string }; }; message?: string };
      toast.error('Failed to process sheets: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (survey: Survey) => {
    setEditingSurvey(survey);
    setShowEditPanel(true);
  };

  const onEditSubmit = async (data: { name: string; description: string }) => {
    if (!editingSurvey) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);

      await apiClient.updateSurvey(editingSurvey.id, formData);

      setShowEditPanel(false);
      setEditingSurvey(null);
      fetchSurveys();
      toast.success('Survey updated successfully!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; detail?: string }; }; message?: string };
      toast.error('Failed to update survey: ' + (err.response?.data?.error || err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDialog.surveyId) return;

    try {
      await apiClient.deleteSurvey(confirmDialog.surveyId);
      fetchSurveys();
      toast.success('Survey deleted successfully!');
    } catch (error) {
      console.error('Error deleting survey:', error);
      toast.error('Failed to delete survey');
    } finally {
      setConfirmDialog({ isOpen: false, surveyId: null, surveyName: '' });
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Records', 'Upload Date'];
    const csvData = filteredItems.map(survey => [
      survey.id,
      survey.name,
      survey.total_records,
      new Date(survey.upload_date).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `surveys_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported to CSV successfully!');
  };

  const exportToExcel = () => {
    // For now, export as CSV with .xlsx extension
    // In production, you'd use a library like xlsx
    exportToCSV();
    toast.info('Excel export coming soon! Downloaded as CSV for now.');
  };

  // Get the project name for the filter badge
  const filteredProject = projectFilter ? projects.find(p => p.id === Number(projectFilter)) : null;

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Surveys List</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500">Manage and track all surveys</p>
              {projectFilter && filteredProject && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtered by: {filteredProject.name}
                  <button
                    onClick={() => window.location.href = '/surveys'}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    title="Clear filter"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAddPanel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Survey
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Filters */}
            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>

              {/* Date Range Filter */}
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              {/* Source Filter */}
              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="upload">Upload</option>
                <option value="api">API</option>
                <option value="import">Import</option>
              </select>

              {/* Filter Icon Button */}
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>

            {/* Right side - Search and Export */}
            <div className="flex items-center gap-3">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Search surveys..."
              />

              {/* Export PDF Button */}
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export PDF
              </button>

              {/* Export Excel Button */}
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading surveys...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              {searchQuery ? `No surveys found matching "${searchQuery}"` : 'No surveys found'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </th>
                      <SortableTableHeader
                        field="id"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={setSorting}
                      >
                        Survey ID
                      </SortableTableHeader>
                      <SortableTableHeader
                        field="name"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={setSorting}
                      >
                        Name
                      </SortableTableHeader>
                      <SortableTableHeader
                        field="total_records"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={setSorting}
                      >
                        Records
                      </SortableTableHeader>
                      <SortableTableHeader
                        field="upload_date"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={setSorting}
                      >
                        Upload Date
                      </SortableTableHeader>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((survey) => (
                      <tr key={survey.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">#{survey.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{survey.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{survey.total_records.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(survey.upload_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <ActionMenu
                            surveyId={survey.id}
                            surveyName={survey.name}
                            onEdit={() => handleEdit(survey)}
                            onDelete={() => setConfirmDialog({
                              isOpen: true,
                              surveyId: survey.id,
                              surveyName: survey.name
                            })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-gray-200 px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredItems.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            </>
          )}
        </div>

        {/* Slide-in Panel for Adding Survey */}
        {showAddPanel && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => !uploading && setShowAddPanel(false)}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Add New Survey</h2>
                  <button
                    onClick={() => !uploading && setShowAddPanel(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    disabled={uploading}
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {!sheetSelection ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Project Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('project_id', { required: 'Project is required' })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a project</option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                        {errors.project_id && (
                          <p className="mt-1 text-sm text-red-600">{errors.project_id.message as string}</p>
                        )}
                      </div>

                      {/* Survey Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Survey Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('name', { required: 'Survey name is required' })}
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter survey name"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          {...register('description')}
                          rows={4}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Enter survey description..."
                        />
                      </div>

                      {/* File Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload File <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                          <label htmlFor="file-upload" className="cursor-pointer block">
                            <input
                              {...register('file', { required: 'File is required' })}
                              type="file"
                              accept=".csv,.xlsx,.xls"
                              className="hidden"
                              id="file-upload"
                            />
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">
                              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                            </p>
                            <p className="mt-1 text-xs text-gray-500">CSV, XLSX, or XLS files</p>
                          </label>
                        </div>
                        {errors.file && (
                          <p className="mt-1 text-sm text-red-600">{errors.file.message as string}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={uploading}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {uploading ? 'Uploading...' : 'Upload Survey'}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Select Sheets to Import</h3>
                      <div className="space-y-2">
                        {sheetSelection.sheetNames.map((sheet) => (
                          <label key={sheet} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSheets.includes(sheet)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSheets([...selectedSheets, sheet]);
                                } else {
                                  setSelectedSheets(selectedSheets.filter(s => s !== sheet));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{sheet}</span>
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={handleSheetSelection}
                        disabled={selectedSheets.length === 0 || uploading}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {uploading ? 'Processing...' : `Import ${selectedSheets.length} Sheet(s)`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Edit Panel */}
        {showEditPanel && editingSurvey && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => !uploading && setShowEditPanel(false)}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Edit Survey</h2>
                  <button
                    onClick={() => !uploading && setShowEditPanel(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    disabled={uploading}
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-6">
                    {/* Survey Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Survey Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('name', { required: 'Survey name is required' })}
                        type="text"
                        defaultValue={editingSurvey.name}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter survey name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        rows={4}
                        defaultValue={editingSurvey.description}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Enter survey description..."
                      />
                    </div>

                    {/* Info Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> You can only edit the name and description. To change the data, please upload a new survey.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {uploading ? 'Updating...' : 'Update Survey'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Delete Survey"
          message={`Are you sure you want to delete "${confirmDialog.surveyName}"? This action cannot be undone.`}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDialog({ isOpen: false, surveyId: null, surveyName: '' })}
        />
      </div>
    </Layout>
  );
}

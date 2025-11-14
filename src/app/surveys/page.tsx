'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import ConfirmDialog from '@/components/ConfirmDialog';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

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
  const [sheetSelection, setSheetSelection] = useState<{
    surveyId: number;
    sheetNames: string[];
  } | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    surveyId: number | null;
    surveyName: string;
  }>({ isOpen: false, surveyId: null, surveyName: '' });
  const { register, handleSubmit, reset, setValue } = useForm();

  // Pagination and search
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
    itemsPerPage: 10,
    searchFields: ['name', 'description']
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

  const onSubmit = async (data: any) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('file', data.file[0]);

      const response = await apiClient.uploadSurvey(formData);

      // Check if sheet selection is required
      if (response.data.requires_sheet_selection) {
        setSheetSelection({
          surveyId: response.data.survey.id,
          sheetNames: response.data.sheet_names,
        });
        toast.info(response.data.message);
      } else {
        reset();
        fetchSurveys();
        toast.success('Survey uploaded successfully!');
      }
    } catch (error: any) {
      toast.error('Failed to upload survey: ' + (error.response?.data?.error || error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSheetSelection = async () => {
    if (!sheetSelection || selectedSheets.length === 0) {
      toast.warning('Please select at least one sheet');
      return;
    }

    try {
      setUploading(true);
      await apiClient.processSheets(sheetSelection.surveyId, selectedSheets);
      setSheetSelection(null);
      setSelectedSheets([]);
      reset();
      fetchSurveys();
      toast.success(`Successfully imported ${selectedSheets.length} sheet(s)!`);
    } catch (error: any) {
      toast.error('Failed to process sheets: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const toggleSheetSelection = (sheetName: string) => {
    setSelectedSheets(prev =>
      prev.includes(sheetName)
        ? prev.filter(s => s !== sheetName)
        : [...prev, sheetName]
    );
  };

  const selectAllSheets = () => {
    if (sheetSelection) {
      setSelectedSheets(sheetSelection.sheetNames);
    }
  };

  const deselectAllSheets = () => {
    setSelectedSheets([]);
  };

  const cancelSheetSelection = () => {
    setSheetSelection(null);
    setSelectedSheets([]);
    reset();
  };

  const handleEdit = (survey: Survey) => {
    setEditingSurvey(survey);
    setValue('name', survey.name);
    setValue('description', survey.description);
  };

  const handleUpdate = async (data: any) => {
    if (!editingSurvey) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);

      // Only append file if a new one was selected
      if (data.file && data.file.length > 0) {
        formData.append('file', data.file[0]);
      }

      await apiClient.updateSurvey(editingSurvey.id, formData);
      setEditingSurvey(null);
      reset();
      fetchSurveys();
      toast.success('Survey updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update survey: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (surveyId: number, surveyName: string) => {
    setConfirmDialog({
      isOpen: true,
      surveyId,
      surveyName
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.surveyId) return;

    try {
      await apiClient.deleteSurvey(confirmDialog.surveyId);
      fetchSurveys();
      toast.success('Survey archived successfully!');
    } catch (error: any) {
      toast.error('Failed to delete survey: ' + (error.response?.data?.error || error.message));
    } finally {
      setConfirmDialog({ isOpen: false, surveyId: null, surveyName: '' });
    }
  };

  const cancelDelete = () => {
    setConfirmDialog({ isOpen: false, surveyId: null, surveyName: '' });
  };

  const cancelEdit = () => {
    setEditingSurvey(null);
    reset();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Surveys</h1>

        {/* Sheet Selection Modal */}
        {sheetSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Select Excel Sheets</h2>
              <p className="text-gray-600 mb-4">
                This Excel file contains multiple sheets. Select one or more sheets to import.
                All selected sheets will be combined into one survey.
              </p>

              {/* Select All / Deselect All buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={selectAllSheets}
                  className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAllSheets}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
                >
                  Deselect All
                </button>
                <span className="ml-auto text-sm text-gray-600">
                  {selectedSheets.length} of {sheetSelection.sheetNames.length} selected
                </span>
              </div>

              {/* Checkboxes for each sheet */}
              <div className="border border-gray-300 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                {sheetSelection.sheetNames.map((name) => (
                  <label
                    key={name}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSheets.includes(name)}
                      onChange={() => toggleSheetSelection(name)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">{name}</span>
                  </label>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSheetSelection}
                  disabled={selectedSheets.length === 0 || uploading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400"
                >
                  {uploading ? 'Processing...' : `Import ${selectedSheets.length} Sheet${selectedSheets.length !== 1 ? 's' : ''}`}
                </button>
                <button
                  onClick={cancelSheetSelection}
                  disabled={uploading}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload/Edit Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {editingSurvey ? 'Edit Survey' : 'Upload New Survey'}
            </h2>
            {editingSurvey && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-600 hover:text-gray-800"
              >
                <i></i>Cancel Edit
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit(editingSurvey ? handleUpdate : onSubmit)} className="space-y-4">
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
              <label className="block text-gray-700 font-semibold mb-2">
                Select File {editingSurvey && '(optional - leave empty to keep current file)'}
              </label>
              <input
                type="file"
                {...register('file', { required: !editingSurvey })}
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
              {uploading ? (editingSurvey ? 'Updating...' : 'Uploading...') : (editingSurvey ? 'Update Survey' : 'Upload Survey')}
            </button>
          </form>
        </div>

        {/* Surveys List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800">Uploaded Surveys</h2>
            <div className="w-full sm:w-96">
              <SearchBar
                placeholder="Search by name or description..."
                onSearch={setSearchQuery}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading surveys...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              {searchQuery ? `No surveys found matching "${searchQuery}"` : 'No surveys uploaded yet'}
            </div>
          ) : (
            <>
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
                    {paginatedItems.map((survey) => (
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
                        <button
                          onClick={() => handleEdit(survey)}
                          className="text-yellow-600 hover:text-yellow-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(survey.id, survey.name)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredItems.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </>
          )}
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Survey"
        message={`Are you sure you want to delete "${confirmDialog.surveyName}"? This will archive the survey.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
      />
    </Layout>
  );
}


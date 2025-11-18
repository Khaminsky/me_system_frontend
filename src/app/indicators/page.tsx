'use client';

import { useEffect, useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import ConfirmDialog from '@/components/ConfirmDialog';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import SortableTableHeader from '@/components/SortableTableHeader';
import { usePagination } from '@/hooks/usePagination';

interface Indicator {
  id: number;
  name: string;
  description: string;
  indicator_type: string;
  unit: string;
  baseline: number | null;
  target: number | null;
  formula: string;
  filter_criteria: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_username?: string;
}

interface Survey {
  id: number;
  name: string;
}

// Action Menu Component
function ActionMenu({
  indicator,
  onEdit,
  onDelete
}: {
  indicator: Indicator;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 120; // Approximate height of the menu
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

export default function IndicatorsPage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    indicatorId: number | null;
    indicatorName: string;
  }>({ isOpen: false, indicatorId: null, indicatorName: '' });
  const { register, handleSubmit, setValue, reset } = useForm();

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
    items: indicators,
    itemsPerPage: 10,
    searchFields: ['name', 'type', 'unit', 'formula'],
    defaultSortField: 'name',
    defaultSortDirection: 'asc'
  });

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

      // Get all active indicator IDs
      const activeIndicatorIds = indicators
        .filter(ind => ind.is_active)
        .map(ind => ind.id);

      if (activeIndicatorIds.length === 0) {
        toast.warning('No active indicators found. Please create indicators first.');
        setComputing(false);
        return;
      }

      const response = await apiClient.computeIndicators(
        parseInt(data.survey_id),
        activeIndicatorIds
      );
      setResults(response.data);
    } catch (error: any) {
      toast.error('Failed to compute indicators: ' + (error.response?.data?.detail || error.message));
    } finally {
      setComputing(false);
    }
  };

  const handleEdit = (indicator: Indicator) => {
    setEditingIndicator(indicator);
    setShowEditModal(true);
    setValue('name', indicator.name);
    setValue('description', indicator.description);
    setValue('indicator_type', indicator.indicator_type);
    setValue('unit', indicator.unit);
    setValue('baseline', indicator.baseline);
    setValue('target', indicator.target);
    setValue('formula', indicator.formula);
    setValue('is_active', indicator.is_active);
  };

  const handleUpdate = async (data: any) => {
    if (!editingIndicator) return;

    try {
      await apiClient.updateIndicator(editingIndicator.id, data);
      setShowEditModal(false);
      setEditingIndicator(null);
      reset();
      fetchData();
      toast.success('Indicator updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update indicator: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = (indicatorId: number, indicatorName: string) => {
    setConfirmDialog({
      isOpen: true,
      indicatorId,
      indicatorName
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.indicatorId) return;

    try {
      await apiClient.deleteIndicator(confirmDialog.indicatorId);
      fetchData();
      toast.success('Indicator deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete indicator: ' + (error.response?.data?.error || error.message));
    } finally {
      setConfirmDialog({ isOpen: false, indicatorId: null, indicatorName: '' });
    }
  };

  const cancelDelete = () => {
    setConfirmDialog({ isOpen: false, indicatorId: null, indicatorName: '' });
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingIndicator(null);
    reset();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Indicators</h1>
          <a
            href="/indicators/create"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
          >
            + Create New Indicator
          </a>
        </div>

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
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Computation Results - {results.survey_name}
            </h2>

            <div className="mb-4 text-sm text-gray-600">
              Total rows processed: {results.total_rows_processed}
            </div>

            {/* Computed Indicators */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Computed Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.computed_indicators?.map((indicator: any, index: number) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border ${
                      indicator.status === 'success'
                        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                        : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                    }`}
                  >
                    <p className="text-gray-700 font-semibold text-sm">{indicator.indicator_name}</p>
                    {indicator.status === 'success' ? (
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value}
                      </p>
                    ) : (
                      <p className="text-sm text-red-600 mt-2">{indicator.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Statistics */}
            {results.summary_statistics && Object.keys(results.summary_statistics).length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Summary Statistics</h3>
                <div className="space-y-4">
                  {Object.entries(results.summary_statistics).map(([columnName, stats]: [string, any]) => (
                    <div key={columnName} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <h4 className="text-gray-800 font-bold text-base mb-3">{columnName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 uppercase">Count</p>
                          <p className="text-lg font-semibold text-blue-700">{stats.count ?? '-'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 uppercase">Mean</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {stats.mean !== null && stats.mean !== undefined ? stats.mean.toFixed(2) : '-'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 uppercase">Median</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {stats.median !== null && stats.median !== undefined ? stats.median.toFixed(2) : '-'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 uppercase">Std Dev</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {stats.std !== null && stats.std !== undefined ? stats.std.toFixed(2) : '-'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 uppercase">Min</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {stats.min !== null && stats.min !== undefined ? stats.min.toFixed(2) : '-'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 uppercase">Max</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {stats.max !== null && stats.max !== undefined ? stats.max.toFixed(2) : '-'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 uppercase">Sum</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {stats.sum !== null && stats.sum !== undefined ? stats.sum.toFixed(2) : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Indicators List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800">Available Indicators</h2>
            <div className="w-full sm:w-96">
              <SearchBar
                placeholder="Search by name, type, unit, or formula..."
                onSearch={setSearchQuery}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading indicators...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              {searchQuery ? `No indicators found matching "${searchQuery}"` : 'No indicators defined yet'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <SortableTableHeader
                        field="name"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={setSorting}
                      >
                        Name
                      </SortableTableHeader>
                      <SortableTableHeader
                        field="indicator_type"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={setSorting}
                      >
                        Type
                      </SortableTableHeader>
                      <SortableTableHeader
                        field="unit"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={setSorting}
                      >
                        Unit
                      </SortableTableHeader>
                      <SortableTableHeader
                        field="formula"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={setSorting}
                      >
                        Formula
                      </SortableTableHeader>
                      <SortableTableHeader
                        field="baseline"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={setSorting}
                      >
                        Baseline
                      </SortableTableHeader>
                      <SortableTableHeader
                        field="target"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={setSorting}
                      >
                        Target
                      </SortableTableHeader>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((indicator) => (
                    <tr key={indicator.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{indicator.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold uppercase">
                          {indicator.indicator_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{indicator.unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{indicator.formula}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{indicator.baseline ?? '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{indicator.target ?? '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          indicator.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {indicator.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <ActionMenu
                          indicator={indicator}
                          onEdit={() => handleEdit(indicator)}
                          onDelete={() => handleDelete(indicator.id, indicator.name)}
                        />
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

        {/* Edit Modal */}
        {showEditModal && editingIndicator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Edit Indicator</h2>
                <button
                  onClick={cancelEdit}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit(handleUpdate)} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    {...register('name', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Description</label>
                  <textarea
                    {...register('description')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Type</label>
                    <select
                      {...register('indicator_type', { required: true })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="input">Input</option>
                      <option value="output">Output</option>
                      <option value="outcome">Outcome</option>
                      <option value="impact">Impact</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Unit</label>
                    <input
                      type="text"
                      {...register('unit', { required: true })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Formula</label>
                  <input
                    type="text"
                    {...register('formula', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Baseline</label>
                    <input
                      type="number"
                      step="any"
                      {...register('baseline')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Target</label>
                    <input
                      type="number"
                      step="any"
                      {...register('target')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-gray-700 font-semibold">Active</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Update Indicator
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Indicator"
        message={`Are you sure you want to delete "${confirmDialog.indicatorName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
      />
    </Layout>
  );
}


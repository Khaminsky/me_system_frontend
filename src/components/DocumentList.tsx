'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api-client';
import { DocumentListItem } from '@/types/repository';
import ConfirmDialog from './ConfirmDialog';

interface DocumentListProps {
  documents: DocumentListItem[];
  onRefresh?: () => void;
  showProject?: boolean;
}

export default function DocumentList({ documents, onRefresh, showProject = true }: DocumentListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    documentId: number | null;
    documentTitle: string;
  }>({
    show: false,
    documentId: null,
    documentTitle: '',
  });

  const handleDelete = async () => {
    if (!deleteConfirm.documentId) return;

    try {
      await apiClient.deleteDocument(deleteConfirm.documentId);
      toast.success('Document deleted successfully');
      setDeleteConfirm({ show: false, documentId: null, documentTitle: '' });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = async (doc: DocumentListItem) => {
    try {
      const response = await apiClient.downloadDocument(doc.id);
      // The backend returns the document details with file_url
      if (response.data.file_url) {
        window.open(response.data.file_url, '_blank');
        toast.success('Document download started');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await apiClient.archiveDocument(id);
      toast.success('Document archived successfully');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error archiving document:', error);
      toast.error('Failed to archive document');
    }
  };

  const getFileIcon = (extension: string) => {
    const ext = extension.toLowerCase();
    if (['pdf'].includes(ext)) {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      );
    } else if (['doc', 'docx'].includes(ext)) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      );
    } else if (['xls', 'xlsx'].includes(ext)) {
      return (
        <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      );
    } else if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext)) {
      return (
        <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-gray-600">No documents found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            {/* File Icon and Info */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0">
                {getFileIcon(doc.extension)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                <p className="text-sm text-gray-500 truncate">{doc.file_name}</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium text-gray-700 capitalize">{doc.document_type}</span>
              </div>
              {showProject && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Project:</span>
                  <span className="font-medium text-gray-700 truncate ml-2">{doc.project_name}</span>
                </div>
              )}
              {doc.category_name && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium text-gray-700">{doc.category_name}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Size:</span>
                <span className="font-medium text-gray-700">{formatFileSize(doc.file_size)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Uploaded:</span>
                <span className="font-medium text-gray-700">{formatDate(doc.uploaded_at)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">By:</span>
                <span className="font-medium text-gray-700">{doc.uploaded_by_name}</span>
              </div>
            </div>

            {/* Tags */}
            {doc.tags && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {doc.tags.split(',').map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t">
              <button
                onClick={() => handleDownload(doc)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              {!doc.is_archived && (
                <button
                  onClick={() => handleArchive(doc.id)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition"
                  title="Archive"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setDeleteConfirm({ show: true, documentId: doc.id, documentTitle: doc.title })}
                className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded hover:bg-red-50 transition"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Archived Badge */}
            {doc.is_archived && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  Archived
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteConfirm.documentTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, documentId: null, documentTitle: '' })}
      />
    </>
  );
}


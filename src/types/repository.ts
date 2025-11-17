export interface DocumentCategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
  created_by: number;
  created_by_name: string;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  document_type: 'proposal' | 'contract' | 'report' | 'presentation' | 'spreadsheet' | 'image' | 'other';
  project: number;
  project_name: string;
  category: number | null;
  category_name: string | null;
  file: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_size_mb: number;
  extension: string;
  mime_type: string;
  file_hash: string;
  version: number;
  parent_document: number | null;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_at: string;
  updated_at: string;
  is_public: boolean;
  is_archived: boolean;
  archived_at: string | null;
  archived_by: number | null;
  tags: string;
}

export interface DocumentListItem {
  id: number;
  title: string;
  document_type: string;
  project: number;
  project_name: string;
  category: number | null;
  category_name: string | null;
  file_name: string;
  file_size: number;
  file_size_mb: number;
  extension: string;
  mime_type: string;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_at: string;
  is_archived: boolean;
  version: number;
  tags: string;
}

export interface DocumentAccessLog {
  id: number;
  document: number;
  document_title: string;
  accessed_by: number;
  accessed_by_name: string;
  accessed_at: string;
  ip_address: string;
  action: 'view' | 'download' | 'update' | 'delete';
}

export interface DocumentStatistics {
  total_documents: number;
  total_size_bytes: number;
  total_size_mb: number;
  by_type: Record<string, number>;
  by_project: Record<string, number>;
}

export interface DocumentFormData {
  title: string;
  description: string;
  document_type: string;
  project_id: string;
  category_id: string;
  file: FileList;
  is_public: boolean;
  tags: string;
}

export const DOCUMENT_TYPES = [
  { value: 'proposal', label: 'Proposal' },
  { value: 'contract', label: 'Contract' },
  { value: 'report', label: 'Report' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'image', label: 'Image' },
  { value: 'other', label: 'Other' },
];

export const ALLOWED_FILE_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.ppt', '.pptx', '.png', '.jpg', '.jpeg', '.gif', '.bmp'
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB


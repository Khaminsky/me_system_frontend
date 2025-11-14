'use client';

import { useState, useMemo, useCallback } from 'react';

type SortDirection = 'asc' | 'desc' | null;

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
  searchFields?: (keyof T)[];
  defaultSortField?: keyof T | null;
  defaultSortDirection?: 'asc' | 'desc';
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  searchQuery: string;
  paginatedItems: T[];
  filteredItems: T[];
  sortField: keyof T | null;
  sortDirection: SortDirection;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  setSearchQuery: (query: string) => void;
  setSorting: (field: keyof T) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function usePagination<T>({
  items,
  itemsPerPage: initialItemsPerPage = 10,
  searchFields = [],
  defaultSortField = null,
  defaultSortDirection = 'asc'
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof T | null>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortField ? defaultSortDirection : null);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim() || searchFields.length === 0) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [items, searchQuery, searchFields]);

  // Sort filtered items
  const sortedItems = useMemo(() => {
    if (!sortField || !sortDirection) {
      return filteredItems;
    }

    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Compare values
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredItems, sortField, sortDirection]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));

  // Get paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, currentPage, itemsPerPage]);

  // Reset to first page when search query or items per page changes
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSetItemsPerPage = useCallback((count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1);
  }, []);

  // Handle sorting - toggle between asc, desc, and null
  const handleSetSorting = useCallback((field: keyof T) => {
    if (sortField === field) {
      // Same field - toggle direction: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      // New field - start with ascending
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [sortField, sortDirection]);

  // Navigation functions
  const goToFirstPage = useCallback(() => setCurrentPage(1), []);
  const goToLastPage = useCallback(() => setCurrentPage(totalPages), [totalPages]);
  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);
  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    searchQuery,
    paginatedItems,
    filteredItems: sortedItems,
    sortField,
    sortDirection,
    setCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    setSearchQuery: handleSetSearchQuery,
    setSorting: handleSetSorting,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage
  };
}


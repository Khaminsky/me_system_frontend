'use client';

import React from 'react';

type SortDirection = 'asc' | 'desc' | null;

interface SortableTableHeaderProps<T> {
  field: keyof T;
  currentSortField: keyof T | null;
  currentSortDirection: SortDirection;
  onSort: (field: keyof T) => void;
  children: React.ReactNode;
  className?: string;
}

export function SortableTableHeader<T>({
  field,
  currentSortField,
  currentSortDirection,
  onSort,
  children,
  className = ''
}: SortableTableHeaderProps<T>) {
  const isActive = currentSortField === field;
  const direction = isActive ? currentSortDirection : null;

  return (
    <th
      className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition select-none ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        <div className="flex flex-col">
          {/* Up arrow */}
          <svg
            className={`w-3 h-3 -mb-1 transition ${
              direction === 'asc' ? 'text-blue-600' : 'text-gray-400'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
          </svg>
          {/* Down arrow */}
          <svg
            className={`w-3 h-3 transition ${
              direction === 'desc' ? 'text-blue-600' : 'text-gray-400'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" />
          </svg>
        </div>
      </div>
    </th>
  );
}

export default SortableTableHeader;


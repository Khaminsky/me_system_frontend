'use client';

import { Suspense } from 'react';
import DataCleaningContent from '@/components/DataCleaningContent';

export default function DataCleaningPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <DataCleaningContent />
    </Suspense>
  );
}


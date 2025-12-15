'use client';

import { Suspense } from 'react';
import RepositoryContent from '@/components/RepositoryContent';

export default function RepositoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <RepositoryContent />
    </Suspense>
  );
}


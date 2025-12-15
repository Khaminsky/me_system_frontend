'use client';

import { Suspense } from 'react';
import SurveysContent from '@/components/SurveysContent';

export default function SurveysPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <SurveysContent />
    </Suspense>
  );
}

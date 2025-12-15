'use client';

import { Suspense } from 'react';
import SurveyCleaningContent from '@/components/SurveyCleaningContent';

export default function SurveyCleaningPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <SurveyCleaningContent />
    </Suspense>
  );
}

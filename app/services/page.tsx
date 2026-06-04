// app/services/page.tsx
import { Suspense } from 'react';
import ServicesClient from './services-client';

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading service...</div>
      </div>
    }>
      <ServicesClient />
    </Suspense>
  );
}
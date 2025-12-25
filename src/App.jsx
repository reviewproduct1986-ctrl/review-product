import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductListing from './pages/ProductListing';

// Lazy load ReviewPage - only loads when user visits a review
const ReviewPage = lazy(() => import('./ReviewPage'));

// Loading component for lazy routes
function RouteLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Loading page...</p>
      </div>
    </div>
  );
}

// Main App component with Router
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductListing />} />
        <Route 
          path="/reviews/:slug" 
          element={
            <Suspense fallback={<RouteLoader />}>
              <ReviewPage />
            </Suspense>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
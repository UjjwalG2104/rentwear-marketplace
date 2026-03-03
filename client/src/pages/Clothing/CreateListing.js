import React from 'react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const CreateListing = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading listing form...</p>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;

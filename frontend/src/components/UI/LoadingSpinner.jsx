import React from 'react';

/**
 * Loading spinner component
 * Used for loading states and suspense fallbacks
 */
const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  const sizeClass = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }[size] || 'w-8 h-8';

  const containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50' 
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClass} data-testid="loading-spinner">
      <div className={`${sizeClass} animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600`}></div>
    </div>
  );
};

export default LoadingSpinner;
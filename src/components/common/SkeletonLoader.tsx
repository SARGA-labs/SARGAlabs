import React from 'react';

interface SkeletonLoaderProps {
  isLoading: boolean;
  /** Optional props to customize the structure of the skeleton. */
  children?: React.ReactNode;
}

/**
 * A reusable SkeletonLoader component to improve perceived performance during data fetching.
 * It mimics the structure of the content that will load into the component.
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ isLoading, children }) => {
  if (!isLoading) {
    return null;
  }

  // Structure for a generic placeholder element
  const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}></div>
  );

  // Structure for a skeleton list item
  const SkeletonListItem: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`flex items-center p-4 bg-white border-b border-gray-100 last:border-b-0 ${className}`}>
      <SkeletonBox className="h-10 w-1/4 mr-4" />
      <div className="flex-grow space-y-1">
        <SkeletonBox className="h-3 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
      </div>
    </div>
  );

  // Structure for a card placeholder
  const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`p-6 bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="h-4 w-3/4 mb-4"></div> {/* Title */}
      <div className="space-y-3">
        <SkeletonBox className="h-3 w-full" /> {/* Subtitle */}
        <SkeletonBox className="h-3 w-5/6" /> {/* Description line 1 */}
        <SkeletonBox className="h-3 w-4/5" /> {/* Description line 2 */}
      </div>
    </div>
  );

  // If custom children are provided, render them (for specific component use)
  if (children) {
    return <>{children}</>;
  }

  // Default skeleton structure for general use (e.g., a feed or list)
  return (
    <div className="space-y-6 py-10">
      <h2 className="text-2xl font-bold text-gray-700">Loading Content...</h2>
      {/* Example: Displaying 3 skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <h3 className="mt-8 text-lg font-semibold text-gray-700">Activity Feed</h3>
      {/* Example: Displaying 3 skeleton list items */}
      <div className="space-y-3">
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
      </div>
    </div>
  );
};

export default SkeletonLoader;

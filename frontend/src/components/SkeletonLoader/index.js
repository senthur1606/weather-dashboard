import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonBlock = ({ className = '' }) => (
  <div className={`shimmer rounded-lg bg-white/5 ${className}`} />
);

export const WeatherSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-4"
  >
    {/* Main card skeleton */}
    <div className="glass-card rounded-3xl p-8">
      <div className="flex justify-between mb-8">
        <div className="space-y-3">
          <SkeletonBlock className="w-16 h-3" />
          <SkeletonBlock className="w-48 h-10" />
          <SkeletonBlock className="w-32 h-4" />
        </div>
        <SkeletonBlock className="w-24 h-24 rounded-full" />
      </div>
      <SkeletonBlock className="w-40 h-24 mb-8" />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>

    {/* Forecast skeleton */}
    <div className="glass-card rounded-3xl p-6">
      <div className="flex justify-between mb-5">
        <SkeletonBlock className="w-24 h-6" />
        <SkeletonBlock className="w-28 h-8 rounded-xl" />
      </div>
      <div className="space-y-2">
        {[...Array(7)].map((_, i) => (
          <SkeletonBlock key={i} className="h-12 rounded-2xl" />
        ))}
      </div>
    </div>
  </motion.div>
);

const SkeletonLoader = ({ type = 'weather' }) => {
  if (type === 'weather') return <WeatherSkeleton />;
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <SkeletonBlock key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  );
};

export default SkeletonLoader;

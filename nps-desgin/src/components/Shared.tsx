import React from 'react';
import { motion } from 'motion/react';

export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-container-high ${className}`}
      aria-hidden
      {...props}
    />
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div className={`bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/15 overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
}

export function PageTransition({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6">
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-9 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/15">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/15 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4 py-4 md:py-0">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6">
          <div className="flex justify-between mb-8">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6">
          <div className="mb-8">
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6">
          <div className="mb-8">
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      </div>
    </>
  );
}

export function AppLoadSkeleton() {
  return (
    <div className="min-h-screen bg-surface flex">
      <div className="w-64 h-screen bg-surface-container-low p-4">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <div className="flex-1 ml-0">
        <div className="h-14 border-b border-outline-variant/15 flex items-center px-8">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-8 space-y-6">
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant/30">
            <th className="w-8 py-3 px-2"></th>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="text-left py-3 px-4">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-outline-variant/15">
              <td className="py-3 px-2">
                <Skeleton className="h-4 w-4 rounded" />
              </td>
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx} className="py-3 px-4">
                  <Skeleton className="h-3 w-full max-w-[80px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

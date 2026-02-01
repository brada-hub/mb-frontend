import React from 'react';

const Skeleton = ({ className = "", style = {} }) => {
    return (
        <div 
            className={`animate-pulse bg-white/5 rounded-lg ${className}`} 
            style={style}
        />
    );
};

export const SkeletonCard = () => (
    <div className="p-6 bg-[#1a1b26] rounded-2xl border border-white/5 space-y-4">
        <div className="flex justify-between items-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-12" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
        </div>
    </div>
);

export const SkeletonDashboard = () => {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex justify-between items-end">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>

            {/* Content Skeleton (Charts/Tables) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#1a1b26] rounded-3xl p-6 border border-white/5 h-[400px] flex flex-col space-y-6">
                         <div className="flex justify-between">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-8 w-24" />
                         </div>
                         <Skeleton className="flex-1 w-full rounded-xl" />
                    </div>
                    
                    <div className="bg-[#1a1b26] rounded-3xl p-6 border border-white/5 h-[300px]">
                        <Skeleton className="h-6 w-48 mb-6" />
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                    <div className="bg-[#1a1b26] rounded-3xl p-6 border border-white/5 h-[350px]">
                        <Skeleton className="h-6 w-32 mb-6" />
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1a1b26] rounded-3xl p-6 border border-white/5 h-[350px]">
                        <Skeleton className="h-6 w-40 mb-6" />
                        <div className="space-y-4">
                             {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-2 w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonDashboard;

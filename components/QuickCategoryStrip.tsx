'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Laptop,
  Shirt,
  Gamepad2,
  Sparkles,
  Book,
  Heart,
  DumbbellIcon as Dumbbell,
  Baby,
  Watch,
  Package,
  Plane,
} from 'lucide-react';



import { useTranslation } from '@/hooks/useTranslation';

const stockFilters = [
  { id: 'in-stock', name: 'filters.ready', icon: Package, color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-200' },
  { id: 'pre-order', name: 'filters.preorder', icon: Plane, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-200' },
];

interface QuickCategoryStripProps {
  onStockFilterChange?: (filter: 'all' | 'in-stock' | 'pre-order') => void;
}

export default function QuickCategoryStrip({ onStockFilterChange }: QuickCategoryStripProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-stock' | 'pre-order'>('all');
  const { t } = useTranslation();

  const categories = [
    { id: 'all', name: t('categories', 'all'), icon: Home, color: 'text-soyol', count: 124 },
    { id: 'tech', name: t('categories', 'tech'), icon: Laptop, color: 'text-blue-600', count: 48 },
    { id: 'fashion', name: t('categories', 'fashion'), icon: Shirt, color: 'text-pink-600', count: 86 },
    { id: 'gaming', name: t('categories', 'gaming'), icon: Gamepad2, color: 'text-purple-600', count: 32 },
    { id: 'beauty', name: t('categories', 'beauty'), icon: Sparkles, color: 'text-rose-600', count: 54 },
    { id: 'books', name: t('categories', 'books'), icon: Book, color: 'text-amber-600', count: 21 },
    { id: 'pets', name: t('categories', 'pets'), icon: Heart, color: 'text-red-600', count: 18 },
    { id: 'sports', name: t('categories', 'sports'), icon: Dumbbell, color: 'text-green-600', count: 42 },
    { id: 'baby', name: t('categories', 'baby'), icon: Baby, color: 'text-cyan-600', count: 29 },
    { id: 'watches', name: t('categories', 'watches'), icon: Watch, color: 'text-gray-700', count: 15 },
  ];

  const handleFilterChange = (filterId: 'all' | 'in-stock' | 'pre-order') => {
    setActiveFilter(filterId);
    onStockFilterChange?.(filterId);
  };

  return (
    <section
      data-category-strip
      className="sticky top-[70px] z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Horizontal Scroll Container */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Category Buttons */}
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  className={`group flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all ${category.id === 'all' && activeFilter === 'all' ? 'bg-soyol/5 ring-1 ring-soyol/20' : ''
                    }`}
                  onClick={() => handleFilterChange('all')}
                >
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${category.id === 'all' && activeFilter === 'all'
                      ? 'from-soyol/10 to-soyol/5'
                      : 'from-gray-100 to-gray-50'
                      } group-hover:scale-110 transition-transform`}
                  >
                    <Icon
                      className={`w-5 h-5 ${category.id === 'all' && activeFilter === 'all' ? 'text-soyol' : category.color
                        }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap flex flex-col items-center gap-0.5 ${category.id === 'all' && activeFilter === 'all' ? 'text-soyol' : 'text-gray-700'
                      }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-[8px] font-bold opacity-40 lowercase">({category.count} бараа)</span>
                  </span>
                </motion.button>
              );
            })}

            {/* Divider */}
            <div className="flex-shrink-0 w-px h-16 bg-gray-200 mx-2" />

            {/* Stock Filter Buttons */}
            {stockFilters.map((filter, index) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;
              return (
                <motion.button
                  key={filter.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: (categories.length + index) * 0.05,
                  }}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleFilterChange(filter.id as 'in-stock' | 'pre-order')}
                  className={`group flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${isActive
                    ? `${filter.bg} ring-1 ${filter.ring}`
                    : 'hover:bg-gray-50'
                    }`}
                >
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br transition-transform ${isActive
                      ? `${filter.bg}`
                      : 'from-gray-100 to-gray-50'
                      } group-hover:scale-110`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? filter.color : 'text-gray-600'}`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap ${isActive ? filter.color : 'text-gray-700'
                      }`}
                  >
                    {t(filter.name.split('.')[0] as any, filter.name.split('.')[1])}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Fade Gradients (left/right) */}
          <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

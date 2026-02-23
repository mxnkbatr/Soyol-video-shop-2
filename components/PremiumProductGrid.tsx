'use client';

import { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ArrowRight, Zap } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category: string;
  stockStatus?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  discount?: number;
  inventory?: number;
  rating?: number;
  featured?: boolean;
}

interface PremiumProductGridProps {
  products: Product[];
  featuredProducts?: Product[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.5
    }
  },
};

function PremiumProductGrid({ products, featuredProducts }: PremiumProductGridProps) {
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice: formatPriceWithCurrency, currency } = useLanguage();
  const { t } = useTranslation();

  // Separate featured and regular products
  const featured = featuredProducts || products.filter(p => p.featured);
  const regular = products.filter(p => !p.featured);

  const renderProductCard = (product: Product, index: number, isFeatured: boolean = false) => {
    const rating = product.rating || 4.9;
    const isWishlisted = isInWishlist(product.id);

    // Mock old price calculation to show the "crossed out" aesthetic if discount exists
    const displayDiscount = product.discount || 0;
    const oldPrice = displayDiscount > 0
      ? product.price * (1 + displayDiscount / 100)
      : null;

    return (
      <motion.div
        key={product.id}
        variants={itemVariants}
        className="group h-full"
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {product.id ? (
          <Link href={`/product/${product.id}`} className="block h-full">
            {/* 
               AESTHETIC FIX: 
               1. rounded-[1.5rem] (24px) for super soft corners
               2. Shadow instead of border for depth
               3. Pure white bg 
            */}
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 h-full flex flex-col relative">

              {/* Image Section */}
              <div className="relative aspect-square overflow-hidden bg-gray-50/50">

                {/* Top Left: Category Pill OR Featured Badge */}
                <div className="absolute top-3 left-3 z-10">
                  {isFeatured ? (
                    <div className="px-2.5 py-1 bg-white/80 backdrop-blur-md border border-white/20 rounded-full flex items-center shadow-sm">
                      <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-slate-900 uppercase">
                        🔥 TOP
                      </span>
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 bg-orange-50/90 backdrop-blur-sm border border-orange-100 rounded-full flex items-center shadow-sm">
                      <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-orange-600 uppercase">
                        {product.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Top Right: Rating Pill (Matches star style) */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="px-2 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm flex items-center gap-1 border border-gray-100">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] font-bold text-gray-800">{rating}</span>
                  </div>
                </div>

                {/* Wishlist Button (Floating) */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isWishlisted) {
                      removeFromWishlist(product.id);
                      toast.success(t('product', 'removedFromWishlist'));
                    } else {
                      addToWishlist({ ...product } as any);
                      toast.success(t('product', 'addedToWishlist'));
                    }
                  }}
                  className="absolute top-12 right-3 z-20 p-2 rounded-full bg-white shadow-md hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                  />
                </motion.button>

                <Image
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out p-2"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>

              {/* Content Section */}
              <div className="p-4 sm:p-5 flex flex-col flex-1">

                {/* Title: Big, Heavy Font like screenshot */}
                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-[1.1] mb-3 line-clamp-2 tracking-tight group-hover:text-orange-600 transition-colors">
                  {product.name}
                </h3>

                {/* Price Section: Large Numbers & Badges */}
                <div className="mt-auto mb-4">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    {/* Current Price */}
                    <div className="flex items-start">
                      <span className="text-xs font-bold text-orange-500 mr-0.5 mt-1">
                        {currency === 'USD' ? '$' : '₮'}
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-orange-500 tracking-tight">
                        {formatPriceWithCurrency(product.price).replace(/[^\d.,]/g, '')}
                      </span>
                    </div>

                    {/* Old Price */}
                    {oldPrice && (
                      <span className="text-xs font-medium text-gray-400 line-through decoration-gray-300">
                        {Math.round(oldPrice).toLocaleString()}
                      </span>
                    )}

                    {/* Discount Tag - Green Pill like screenshot */}
                    {displayDiscount > 0 && (
                      <div className="ml-auto px-2 py-0.5 bg-emerald-100 rounded-md flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-700">-{displayDiscount}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button: Styled to match 'View Details' in screenshot */}
                <div className="w-full">
                  <div className="relative w-full py-2.5 sm:py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 font-bold text-xs sm:text-sm shadow-sm group-hover:bg-gray-900 group-hover:text-white group-hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden">
                    <span className="relative z-10">Дэлгэрэнгүй</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>
            </div>
          </Link>
        ) : (
          // Loading Skeleton
          <div className="bg-white rounded-[1.5rem] p-4 h-full border border-gray-100 opacity-50">
            <div className="aspect-square bg-gray-100 rounded-xl mb-4" />
            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      {/* Featured Products Section */}
      {featured.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 p-2 sm:p-4 mb-8"
        >
          {featured.map((product, index) => renderProductCard(product, index, true))}
        </motion.div>
      )}

      {/* Section Heading Separator */}
      {featured.length > 0 && regular.length > 0 && (
        <div className="px-2 sm:px-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Бүх бүтээгдэхүүн
          </h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-orange-500 to-orange-300 mt-2 rounded-full"></div>
        </div>
      )}

      {/* Regular Products Section */}
      {regular.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 p-2 sm:p-4"
        >
          {regular.map((product, index) => renderProductCard(product, index, false))}
        </motion.div>
      )}
    </>
  );
}

export default memo(PremiumProductGrid);

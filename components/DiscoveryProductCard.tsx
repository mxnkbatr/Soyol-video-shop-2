'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Eye, Package, Clock, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { formatPrice, formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import type { Product } from '@/models/Product';

import { useAuth } from '@/context/AuthContext';

interface DiscoveryProductCardProps {
  product: Product;
  index?: number;
  showTrendingBadge?: boolean;
}

export default function DiscoveryProductCard({ product, index = 0, showTrendingBadge = false }: DiscoveryProductCardProps) {
  const { isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSecondaryImage, setShowSecondaryImage] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image || '/soyol-logo.png');
  const addItem = useCartStore((state) => state.addItem);

  // Update imgSrc if product image changes
  useEffect(() => {
    setImgSrc(product.image || '/soyol-logo.png');
  }, [product.image]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(product);
    toast.success('Сагсанд нэмэгдлээ', {
      duration: 2000,
      position: 'top-right',
      style: {
        background: '#1e293b',
        color: 'white',
        fontWeight: '500',
        borderRadius: '16px',
      },
      icon: '✓',
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Нэвтрэх шаардлагатай', {
        duration: 2000,
        position: 'top-right',
        style: {
          borderRadius: '16px',
        },
      });
      return;
    }

    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted ? 'Хүслээс хассан' : 'Хүсэлд нэмсэн',
      {
        duration: 1500,
        position: 'top-right',
        icon: isWishlisted ? '💔' : '❤️',
        style: {
          borderRadius: '16px',
        },
      }
    );
  };

  const InnerCard = () => (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden shrink-0">
        {/* Images with Zoom Effect */}
        <AnimatePresence mode="wait">
          <motion.div
            key={showSecondaryImage ? 'secondary' : 'primary'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgSrc('/soyol-logo.png')}
            />
          </motion.div>
        </AnimatePresence>

        {/* Status Badges - Refined Glassmorphism Style (Top Left) */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 pointer-events-none">
          {product.stockStatus === 'in-stock' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="px-2 py-0.5 bg-white/60 backdrop-blur-md text-emerald-600 rounded-full flex items-center gap-1 border border-white/40 shadow-sm pointer-events-auto"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-wide">БЭЛЭН</span>
            </motion.div>
          )}
          {product.stockStatus === 'pre-order' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="px-2 py-0.5 bg-white/60 backdrop-blur-md text-blue-600 rounded-full flex items-center gap-1 border border-white/40 shadow-sm pointer-events-auto"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[8px] font-black uppercase tracking-wide">ЗАХИАЛГААР</span>
            </motion.div>
          )}
        </div>

        {/* Wishlist Button - Minimal (Top Right) */}
        <div className="absolute top-2 right-2 z-10">
          <motion.button
            onClick={handleWishlist}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${isWishlisted
              ? 'bg-red-500 text-white shadow-red-500/30'
              : 'bg-white/95 text-slate-400 hover:text-red-500 border border-slate-100'
              }`}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
              strokeWidth={2}
            />
          </motion.button>
        </div>

        {/* Quick Actions - Minimal Slide up on hover */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{
            y: isHovered ? '0%' : '100%',
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white/98 via-white/90 to-transparent backdrop-blur-md"
        >
          <div className="flex gap-2">
            <motion.button
              onClick={handleQuickAdd}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-10 px-4 bg-[#FF5000] text-white font-black text-[10px] rounded-full flex items-center justify-center gap-2 hover:bg-[#E64500] active:scale-95 transition-all shadow-md shadow-orange-500/10"
            >
              <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2.5} />
              САГСЛАХ
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-10 h-10 bg-white border border-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:border-slate-900 transition-colors shadow-sm"
            >
              <Eye className="w-4 h-4" strokeWidth={2} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Card Content - Premium Typography */}
      <div className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight tracking-tight group-hover:text-orange-600 transition-colors h-10 overflow-hidden">
          {product.name}
        </h3>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-orange-500 tracking-tight">
              {formatCurrency(product.price)}
              <span className="text-sm ml-0.5 tracking-normal"> ₮</span>
            </p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold text-slate-400">{product.rating || 0}</span>
            </div>
          </div>
          {product.stockStatus === 'pre-order' && (
            <p className="text-[10px] font-bold text-purple-500 flex items-center gap-1 italic">
              <Clock className="w-2.5 h-2.5" />
              Ирэх хугацаа: 14 хоног
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onHoverStart={() => {
        setIsHovered(true);
        setShowSecondaryImage(true);
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        setShowSecondaryImage(false);
      }}
      className="group block h-full"
    >
      {product.id ? (
        <Link href={`/product/${product.id}`} className="block h-full">
          <InnerCard />
        </Link>
      ) : (
        <div className="block cursor-not-allowed opacity-70 h-full">
          <InnerCard />
        </div>
      )}
    </motion.div>
  );
}

// Minimal Star Icon
const Star = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20">
    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
  </svg>
);

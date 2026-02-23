'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Heart, Share2, Star, Zap, ShoppingBag, CreditCard, User,
  ChevronRight, ShieldCheck, RotateCcw, Truck, MapPin,
  Info, CheckCircle2, Package, Eye, Clock, Award, Check,
  Minus, Plus, ArrowRight
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import RelatedProducts from './RelatedProducts';
import type { Product } from '@/models/Product';

export type ProductDetailData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  image: string | null;
  category: string;
  stockStatus: string;
  inventory?: number;
  brand?: string;
  model?: string;
  delivery?: string;
  paymentMethods?: string;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  wholesale?: boolean;
  relatedProducts?: Product[];
};

export default function ProductDetailClient({ product }: { product: ProductDetailData }) {
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const rating = product.rating ?? 4.5;
  const router = useRouter();
  const { addItem } = useCartStore();
  const { t } = useTranslation();

  // Mock multiple images for the gallery if only one exists
  const images = product.image ? [
    product.image,
    product.image, // Mock
    product.image  // Mock
  ] : ['/soyol-logo.png'];

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Нэвтрэх шаардлагатай', {
        duration: 2000,
        position: 'top-right',
        style: { borderRadius: '16px' },
      });
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Хүслээс хассан' : 'Хүсэлд нэмсэн');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Soyol Video Shop`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      toast.success('Link copied to clipboard');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ ...product, image: product.image || '', rating: product.rating ?? 0, stockStatus: product.stockStatus as any });
    }
    toast.custom((toastInstance) => (
      <div className={`${toastInstance.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{t('toast', 'addedToCart')}</p>
              <p className="mt-1 text-sm text-gray-500">{product.name}</p>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const handleBuyNow = () => {
    addItem({ ...product, image: product.image || '', rating: product.rating ?? 0, stockStatus: product.stockStatus as any });
    router.push('/checkout');
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;


  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-[#F5F5F7] pb-32 md:pb-0"
    >
      {/* Sticky Header for Quick Actions (Desktop) */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: isScrolled ? 0 : -100 }}
        className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-4 py-3 hidden md:block"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 relative rounded-lg overflow-hidden border border-slate-100">
              <Image src={product.image || '/soyol-logo.png'} alt={product.name} fill className="object-contain p-1" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{product.name}</h3>
              <p className="text-orange-500 font-bold text-sm">{formatPrice(product.price)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleAddToCart} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full font-bold text-sm transition-colors">
              Сагсанд
            </button>
            <button onClick={handleBuyNow} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-sm transition-colors shadow-lg shadow-orange-500/20">
              Худалдаж авах
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1440px] mx-auto px-0 md:px-6 lg:px-8 py-0 md:py-8">
        {/* Breadcrumbs (Desktop) */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide px-4 md:px-0">
          <Link href="/" className="hover:text-slate-900 transition-colors">Нүүр</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-slate-900 transition-colors capitalize">{product.category}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12">

          {/* Left: Mobile First Gallery (7 cols) */}
          <div className="lg:col-span-7 bg-white md:bg-transparent pb-6 md:pb-0">
            {/* Mobile Carousel - Snap Scroll */}
            <div className="relative w-full aspect-square md:aspect-[4/3] md:rounded-3xl overflow-hidden md:bg-white md:border md:border-slate-100 md:shadow-sm group">
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full w-full">
                {images.map((img, i) => (
                  <div key={i} className="flex-none w-full h-full snap-center relative">
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-contain p-8 md:p-12"
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${activeImageIndex === i ? 'bg-slate-800 w-3' : 'bg-slate-300'}`}
                  />
                ))}
              </div>

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.stockStatus === 'in-stock' ? (
                  <div className="px-2.5 py-1 backdrop-blur-md bg-white/90 border border-orange-100 rounded-full shadow-sm flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-orange-600 fill-orange-600" />
                    <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">БЭЛЭН</span>
                  </div>
                ) : (
                  <div className="px-2.5 py-1 backdrop-blur-md bg-white/90 border border-slate-100 rounded-full shadow-sm flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">ЗАХИАЛГААР</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="px-2.5 py-1 bg-red-500 text-white rounded-full shadow-sm flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">-{discount}%</span>
                  </div>
                )}
              </div>

              {/* Share & Wishlist Fab */}
              <div className="absolute top-4 right-4 flex flex-col gap-3">
                <button
                  onClick={handleWishlist}
                  className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 transition-all active:scale-90"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-100 text-slate-400 hover:text-blue-500 transition-all active:scale-90"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Desktop Thumbnails (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-4 gap-4 mt-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setActiveImageIndex(i)}
                  className={`relative aspect-square rounded-2xl overflow-hidden bg-white border-2 transition-all ${i === activeImageIndex ? 'border-orange-500 ring-2 ring-orange-100' : 'border-slate-100 hover:border-slate-300'
                    }`}
                >
                  <Image src={img} alt="" fill className="object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info & Buy Box (5 cols) */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8 px-4 md:px-0 mt-4 md:mt-0">
            {/* Header Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Link href={`/store/${product.category.toLowerCase()}`} className="text-orange-600 font-extrabold text-xs md:text-sm tracking-widest uppercase hover:underline">
                  {product.brand || product.category}
                </Link>
                <div className="flex items-center gap-1 text-amber-400 bg-amber-50 px-2 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-slate-700 font-bold text-xs">{rating}</span>
                </div>
              </div>

              <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-end gap-3 pt-2">
                <span className="text-3xl md:text-4xl font-bold text-orange-500 tracking-tight">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm md:text-lg text-slate-400 line-through decoration-2 mb-1">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm text-slate-600 bg-slate-50 p-4 rounded-2xl">
              <p className="leading-relaxed">{product.description || 'Энэхүү бүтээгдэхүүн нь хамгийн сүүлийн үеийн технологиор бүтээгдсэн бөгөөд мэргэжлийн түвшний гүйцэтгэлийг танд санал болгож байна.'}</p>
            </div>

            {/* Quantity & Actions (Desktop) */}
            <div className="hidden md:block space-y-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Тоо ширхэг</span>
                <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-full px-4 py-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.inventory ?? 10, quantity + 1))} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-bold hover:border-slate-900 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Сагсанд нэмэх
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
                >
                  Шууд авах
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-center gap-3 p-3 md:p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs md:text-sm">Шуурхай хүргэлт</h4>
                  <p className="text-[10px] text-slate-500">{product.delivery || '24-48 цаг'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Specs & Info */}
        <div className="mt-12 md:mt-20 px-4 md:px-0">
          <div className="bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-slate-100">
            <h2 className="text-lg md:text-2xl font-black text-slate-900 mb-6 md:mb-8">Техник үзүүлэлт</h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-0 md:gap-y-6">
              {[
                { label: 'Брэнд', value: product.brand || product.category },
                { label: 'Загвар', value: product.model || product.name },
                { label: 'Төлөв', value: product.stockStatus === 'in-stock' ? 'Бэлэн' : 'Захиалгаар' },
                { label: 'Хүргэлт', value: product.delivery || 'Үнэгүй' },
                { label: 'Төлбөрийн нөхцөл', value: product.paymentMethods || 'QPay, SocialPay, Card' }
              ].map((spec, i) => (
                <div key={i} className="flex justify-between py-3 md:py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                  <span className="text-slate-500 font-medium text-sm">{spec.label}</span>
                  <span className="text-slate-900 font-bold text-right text-sm">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12 md:mt-20 px-4 md:px-0">
          <RelatedProducts products={product.relatedProducts || []} />
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 md:hidden z-[100] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3">
          <div className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900">{quantity}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold text-sm transition-all"
          >
            Сагслах
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-1"
          >
            Худалдан авах
          </button>
        </div>
      </div>
      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 md:hidden z-50 pb-safe">
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="flex-1 py-3.5 bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
          >
            Сагслах
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBuyNow}
            className="flex-1 py-3.5 bg-[#FF5000] text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
          >
            Захиалах
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

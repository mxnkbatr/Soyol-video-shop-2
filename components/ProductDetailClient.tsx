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
  discount?: number;
  discountPercent?: number;
  image: string | null;
  images?: string[];
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
  sections?: string[];
  featured?: boolean;
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

  // 1. Professional Image Data Handling
  const images: string[] = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : ['/placeholder-product.png'];

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

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
      addItem({
        ...product,
        image: product.image || '',
        rating: product.rating ?? 0,
        stockStatus: product.stockStatus as any,
        description: product.description || undefined
      });
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
    addItem({
      ...product,
      image: product.image || '',
      rating: product.rating ?? 0,
      stockStatus: product.stockStatus as any,
      description: product.description || undefined
    });
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
      className="bg-white min-h-screen pb-40 md:pb-24"
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
              <Image
                src={product.image || '/soyol-logo.png'}
                alt={product.name}
                fill
                className="object-contain p-1"
                onError={(e) => { e.currentTarget.src = '/placeholder-product.png' }}
              />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Breadcrumbs (Desktop) */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide px-4 md:px-0">
          <Link href="/" className="hover:text-slate-900 transition-colors">Нүүр</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-slate-900 transition-colors capitalize">{product.category}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Left: Professional Gallery Implementation (7 cols) */}
          <div className="lg:col-span-7">
            <div className="flex flex-col md:flex-row gap-6">

              {/* Desktop Vertical Thumbnails (Hidden on Mobile) */}
              {images.length > 1 && (
                <div className="hidden md:flex flex-col gap-4 shrink-0">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setActiveImageIndex(i)}
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden bg-white border-2 transition-all active:scale-95 ${i === activeImageIndex
                        ? 'border-[#FF5000] ring-2 ring-[#FF5000]/20 ring-offset-2'
                        : 'border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300'
                        }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => { e.currentTarget.src = '/placeholder-product.png' }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image View */}
              <div className="relative flex-1 aspect-square rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white md:bg-slate-50 border border-slate-100 group">

                {/* Desktop: Scale on Hover | Mobile: Drag Carousel */}
                <div className="relative w-full h-full md:hidden">
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -100 && activeImageIndex < images.length - 1) {
                        setActiveImageIndex(prev => prev + 1);
                      } else if (info.offset.x > 100 && activeImageIndex > 0) {
                        setActiveImageIndex(prev => prev - 1);
                      }
                    }}
                    className="flex w-full h-full"
                    animate={{ x: `-${activeImageIndex * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {images.map((img, i) => (
                      <div key={i} className="relative w-full h-full shrink-0">
                        <Image
                          src={img}
                          alt={`${product.name} ${i + 1}`}
                          fill
                          className="object-contain"
                          onError={(e) => { e.currentTarget.src = '/placeholder-product.png' }}
                          priority={i === 0}
                        />
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Desktop Static View with Hover Zoom */}
                <div className="hidden md:block relative w-full h-full overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={images[activeImageIndex]}
                      alt={product.name}
                      fill
                      className="object-contain p-8 md:p-12"
                      onError={(e) => { e.currentTarget.src = '/placeholder-product.png' }}
                    />
                  </motion.div>
                </div>

                {/* Mobile: Image Count Badge */}
                <span className="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md md:hidden flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  {activeImageIndex + 1} / {images.length}
                </span>

                {/* Status Badges Overlay */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  {product.stockStatus === 'in-stock' ? (
                    <div className="px-3 py-1.5 backdrop-blur-md bg-white/90 border border-orange-100 rounded-full shadow-sm flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">БЭЛЭН</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 backdrop-blur-md bg-white/90 border border-slate-100 rounded-full shadow-sm flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ЗАХИАЛГААР</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="px-3 py-1.5 bg-[#FF5000] text-white rounded-full shadow-lg shadow-orange-500/20 flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest">-{discount}%</span>
                    </div>
                  )}
                </div>

                {/* Share & Wishlist Fab */}
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <button
                    onClick={handleWishlist}
                    className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 transition-all active:scale-90"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-500 transition-all active:scale-90"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:hidden">
                    {images.map((_, i) => (
                      <motion.div
                        key={i}
                        initial={false}
                        animate={{
                          width: activeImageIndex === i ? 24 : 8,
                          backgroundColor: activeImageIndex === i ? '#FF5000' : '#CBD5E1'
                        }}
                        className="h-2 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Product Info & Buy Box (5 cols) */}
          <div className="lg:col-span-5 space-y-8 md:space-y-10 px-4 md:px-0 mt-6 md:mt-0">
            {/* Header Info */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link href={`/store/${product.category.toLowerCase()}`} className="text-[#FF5000] font-black text-xs md:text-sm tracking-[0.2em] uppercase hover:underline">
                  {product.brand || product.category}
                </Link>
                <div className="flex items-center gap-1.5 text-amber-400 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                  <Star className="w-4 h-4 fill-current" strokeWidth={1.2} />
                  <span className="text-slate-900 font-black text-sm">{rating}</span>
                </div>
              </div>

              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-4xl md:text-5xl font-black text-[#FF5000] tracking-tighter">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg md:text-2xl text-slate-400 line-through decoration-[3px] decoration-slate-300/50 mb-1 font-bold">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm text-slate-600 bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
              <p className="leading-relaxed font-medium text-base">{product.description || 'Энэхүү бүтээгдэхүүн нь хамгийн сүүлийн үеийн технологиор бүтээгдсэн бөгөөд мэргэжлийн түвшний гүйцэтгэлийг танд санал болгож байна.'}</p>
            </div>

            {/* Quantity & Actions (Desktop) */}
            <div className="hidden md:block space-y-8 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-slate-900">Тоо ширхэг</span>
                <div className="flex items-center gap-6 bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#FF5000] transition-colors rounded-xl hover:bg-orange-50">
                    <Minus className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                  <span className="w-10 text-center font-black text-xl text-slate-900">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.inventory ?? 10, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#FF5000] transition-colors rounded-xl hover:bg-orange-50">
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <button
                  onClick={handleAddToCart}
                  className="py-5 bg-white border border-slate-200 text-slate-900 rounded-[1.5rem] font-black hover:border-slate-400 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                >
                  <ShoppingBag className="w-6 h-6" strokeWidth={1.2} />
                  Сагсанд нэмэх
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-5 bg-[#FF5000] text-white rounded-[1.5rem] font-black hover:bg-[#E64500] transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Шууд авах
                  <ArrowRight className="w-6 h-6" strokeWidth={1.2} />
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

        {/* Detailed Specs & Info - Tabs Version */}
        <div className="mt-16 md:mt-24 px-4 md:px-0">
          <ProductInfoTabs product={product} />
        </div>

        {/* Related Products */}
        <div className="mt-12 md:mt-20 px-4 md:px-0">
          <RelatedProducts products={product.relatedProducts || []} />
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 md:hidden z-[110] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 rounded-[1.25rem] font-black text-sm active:scale-95 transition-all shadow-sm"
          >
            Сагслах
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBuyNow}
            className="flex-[1.2] py-4 bg-[#FF5000] text-white rounded-[1.25rem] font-black text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
          >
            Худалдан авах
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Sub-component for Product Info Tabs
// Sub-component for Product Info Tabs
function ProductInfoTabs({ product }: { product: any }) {
  const tabs = [
    { id: 'description', label: 'Тайлбар' },
    { id: 'specs', label: 'Тодорхойлолт' },
    { id: 'reviews', label: `Үнэлгээ (${product.reviewCount || 0})` },
  ];
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex border-b border-gray-100 mt-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-bold relative transition-colors ${activeTab === tab.id
              ? 'text-[#FF5000]'
              : 'text-gray-400 hover:text-gray-700'
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5000]"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          {activeTab === 'description' && (
            <div>
              {product.description ? (
                <div className="prose prose-sm text-slate-600 max-w-none">
                  <p className="leading-relaxed font-medium text-base">{product.description}</p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">Тайлбар оруулаагүй байна</p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {product.brand && (
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-600">
                    🏷️ {product.brand}
                  </span>
                )}
                {product.model && (
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-600">
                    ⚙️ Загвар: {product.model}
                  </span>
                )}
                {product.delivery && (
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-600">
                    🚚 Хүргэлт: {product.delivery}
                  </span>
                )}
                {product.paymentMethods && (
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-600">
                    💳 Төлбөр: {product.paymentMethods}
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              {product.attributes && Object.keys(product.attributes).length > 0 ? (
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.attributes || {}).map(([key, val], i) => (
                        <tr key={key} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2.5 px-4 text-gray-500 font-medium w-1/3">{key}</td>
                          <td className="py-2.5 px-4 text-gray-900">{String(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">Тодорхойлолт байхгүй</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="flex flex-col items-center py-8">
              <div className="text-center mb-6">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">
                  {product.rating ? Number(product.rating).toFixed(1) : '0.0'}
                </span>
                <div className="flex justify-center text-amber-400 mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(product.rating || 0) ? 'fill-current' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <div className="text-sm font-medium text-slate-500 mt-2">Нийт {product.reviewCount || 0} үнэлгээ</div>
              </div>

              <div className="w-full max-w-sm space-y-2 mb-8">
                {[5, 4, 3, 2, 1].map((star) => {
                  // Stub out percentages for the static placeholder
                  const pct = Math.round(Math.random() * 80);
                  const width = product.reviewCount > 0 ? (star === 5 ? '72%' : `${pct}%`) : '0%';
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="font-medium text-slate-600 w-4">{star}</span>
                      <Star className="w-4 h-4 fill-slate-300 text-slate-300" />
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width }} />
                      </div>
                      <span className="text-slate-500 font-medium w-8 text-right">{width}</span>
                    </div>
                  );
                })}
              </div>

              <div className="w-full max-w-sm flex flex-col items-center pt-8 border-t border-gray-100">
                {!product.reviewCount && (
                  <p className="text-gray-400 text-sm italic mb-4">
                    Үнэлгээ байхгүй байна. Эхний үнэлгээг бичээрэй!
                  </p>
                )}
                <button className="px-6 py-2.5 bg-[#FF5000] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-[#E64500] transition-colors active:scale-95">
                  Үнэлгээ бичих
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

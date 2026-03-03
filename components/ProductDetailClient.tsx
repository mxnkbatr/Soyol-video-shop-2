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

          {/* Left: Images (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
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
function ProductInfoTabs({ product }: { product: any }) {
  const [activeTab, setActiveTab] = useState('specs');

  const specs = [
    { label: 'Брэнд', value: product.brand || product.category },
    { label: 'Загвар', value: product.model || product.name },
    { label: 'Төлөв', value: product.stockStatus === 'in-stock' ? 'Бэлэн' : 'Захиалгаар' },
    { label: 'Хүргэлт', value: product.delivery || 'Үнэгүй' },
    { label: 'Төлбөрийн нөхцөл', value: product.paymentMethods || 'QPay, SocialPay, Card' }
  ];

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex gap-8 border-b border-slate-100 mb-8 overflow-x-auto scrollbar-hide">
        {[
          { id: 'specs', label: 'Техникийн үзүүлэлт' },
          { id: 'warranty', label: 'Баталгаат хугацаа' },
          { id: 'shipping', label: 'Хүргэлт & Буцаалт' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm md:text-base font-black transition-all relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-[#FF5000]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeProductTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF5000] rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'specs' && (
          <motion.div
            key="specs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 gap-x-12"
          >
            {specs.map((spec, i) => (
              <div key={i} className="flex justify-between py-4 border-b border-slate-50 last:border-0 md:last:border-b">
                <span className="text-slate-500 font-bold text-sm">{spec.label}</span>
                <span className="text-slate-900 font-black text-sm">{spec.value}</span>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'warranty' && (
          <motion.div
            key="warranty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <h4 className="font-black text-[#FF5000] mb-2">Албан ёсны баталгаа</h4>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Энэхүү бүтээгдэхүүнд Soyol Video Shop-оос 1 жилийн албан ёсны баталгааг олгож байна. 
                Баталгаат хугацаанд үйлдвэрийн согог илэрсэн тохиолдолд бид үнэ төлбөргүй засварлаж эсвэл сольж өгөх болно.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li className="flex gap-3">
                <span className="text-[#FF5000]">•</span>
                Механик гэмтэл баталгаанд хамаарахгүй
              </li>
              <li className="flex gap-3">
                <span className="text-[#FF5000]">•</span>
                Зориулалтын бус хэрэглээнээс үүдсэн гэмтэл хамаарахгүй
              </li>
            </ul>
          </motion.div>
        )}

        {activeTab === 'shipping' && (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1">Шуурхай хүргэлт</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">Улаанбаатар хот дотор 24-48 цагийн дотор хүргэгдэнэ. Хүргэлтийн төлбөр 5,000₮.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <ArrowRight className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1">Буцаалт</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">Та бараагаа авснаас хойш 7 хоногийн дотор үйлдвэрийн согогтой бол буцаах боломжтой.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

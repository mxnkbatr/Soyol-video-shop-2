'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';

interface Product {
    id: string;
    _id?: string;
    name: string;
    price: number;
    image?: string | null;
    rating?: number;
    category?: string;
    stockStatus?: string;
    inventory?: number;
    featured?: boolean;
}

interface MobileFeaturedCarouselProps {
    products: Product[];
}

export default function MobileFeaturedCarousel({ products }: MobileFeaturedCarouselProps) {
    const { convertPrice, currency } = useLanguage();
    const { t } = useTranslation();
    const addItem = useCartStore((s) => s.addItem);

    const featuredProducts = products.filter((p) => p.featured);

    const handleAddToCart = (product: Product) => {
        addItem({
            id: product.id || product._id || '',
            name: product.name,
            price: product.price,
            image: product.image || '',
            rating: product.rating ?? 0,
            category: product.category || '',
            stockStatus: (product.stockStatus as 'in-stock' | 'pre-order') || 'in-stock',
        });
        toast.success(t('toast', 'addedToCart'), {
            style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontWeight: 600 },
            iconTheme: { primary: '#f97316', secondary: '#fff' },
        });
    };

    const formatPrice = (price: number) => {
        const converted = convertPrice(price);
        return currency === 'USD'
            ? `$${converted.toLocaleString()}`
            : `${converted.toLocaleString()}₮`;
    };

    if (featuredProducts.length === 0) return null;

    return (
        <section className="mb-6 lg:hidden">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4 px-3">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {t('home', 'featuredProducts')}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {t('home', 'featuredProductsDesc')}
                    </p>
                </div>
            </div>

            {/* Mobile Featured Products Horizontal Scroll */}
            <div
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide pb-4 px-3"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
                {featuredProducts.map((product, i) => (
                    <motion.div
                        key={product.id || product._id || i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="flex-shrink-0 w-[45%] snap-center"
                    >
                        <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
                            {/* 🔥 TOP Badge - Top Right */}
                            <div className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-md text-slate-900 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-white/20">
                                🔥 TOP
                            </div>

                            {/* Stock Badge - Left (Floating & Softer) */}
                            {product.inventory && product.inventory > 0 && (
                                <div className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-white/20 flex items-center gap-1">
                                    {product.inventory} ШИРХЭГ
                                </div>
                            )}

                            {/* Image Container */}
                            <Link href={`/product/${product.id || product._id}`} draggable={false}>
                                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                                    <Image
                                        src={product.image || '/soyol-logo.png'}
                                        alt={product.name}
                                        fill
                                        draggable={false}
                                        className="object-cover group-hover:scale-105 transition-transform duration-500 p-2"
                                        sizes="85vw"
                                    />

                                    {/* Stock Badge */}
                                    {product.stockStatus === 'in-stock' && product.inventory !== undefined && (
                                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md ${product.inventory < 10
                                            ? 'bg-red-500/90 text-white shadow-red-500/30'
                                            : 'bg-white/90 text-slate-700 shadow-black/5'
                                            }`}>
                                            {product.inventory < 10
                                                ? `${product.inventory} ${t('product', 'pieces')}`
                                                : t('product', 'tenPlusPieces')}
                                        </div>
                                    )}

                                    {/* Quick Add Button */}
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}
                                        className="absolute bottom-3 right-3 p-2.5 bg-white rounded-xl shadow-lg text-orange-600 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:bg-orange-500 hover:text-white active:scale-95"
                                    >
                                        <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                                    </button>
                                </div>
                            </Link>

                            {/* Product Info */}
                            <div className="p-4 space-y-2">
                                <Link href={`/product/${product.id || product._id}`} draggable={false}>
                                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                        {product.name}
                                    </h3>
                                </Link>

                                {/* Rating */}
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, idx) => (
                                        <Star
                                            key={idx}
                                            className={`w-3 h-3 ${idx < Math.round(product.rating ?? 4.5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                                        />
                                    ))}
                                    <span className="text-xs font-semibold text-slate-500 ml-0.5">{product.rating ?? 4.5}</span>
                                </div>

                                {/* Price & Category */}
                                <div className="flex items-end justify-between pt-1">
                                    <span className="text-lg font-black text-slate-900">
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.category && (
                                        <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-md">
                                            {product.category}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { type ApiProduct } from '@/lib/hooks/useProducts';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';

interface MobileProductCardProps {
    product: ApiProduct;
}

export default function MobileProductCard({ product }: MobileProductCardProps) {
    const { convertPrice, currency } = useLanguage();
    const price = convertPrice(product.price);

    // Format price
    const formattedPrice = currency === 'USD'
        ? `$${price.toLocaleString()}`
        : `${formatCurrency(price)}`;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100/50 transition-all duration-300"
        >
            <Link href={`/product/${product.id}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-t-2xl">
                    <Image
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw"
                        className="object-cover transition-transform duration-500 group-active:scale-105"
                    />

                    {/* Premium Status Badges */}
                    <div className="absolute top-2 left-2 z-10">
                        {product.stockStatus === 'in-stock' && (
                            <div className="px-2 py-1 bg-white/40 backdrop-blur-md rounded-lg border border-white/20 shadow-sm">
                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">БЭЛЭН</span>
                            </div>
                        )}
                        {product.stockStatus === 'pre-order' && (
                            <div className="px-2 py-1 bg-white/40 backdrop-blur-md rounded-lg border border-white/20 shadow-sm">
                                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wide">ЗАХИАЛГА</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-3 flex flex-col gap-1">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-relaxed min-h-[44px]">
                        {product.name}
                    </h3>

                    <div className="flex items-end justify-between mt-1">
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-orange-500">
                                {formattedPrice}
                            </span>
                            <span className="text-sm font-bold text-orange-500 mb-0.5"> ₮</span>
                        </div>

                        {/* Minimalist Cart Button - Visible on Interaction */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.preventDefault();
                                // Add to cart logic
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200 shadow-md"
                        >
                            <ShoppingCart className="w-4 h-4" strokeWidth={2} />
                        </motion.button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// Minimal Star Icon
const StarIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
    </svg>
);

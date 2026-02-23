'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Trash2, Minus, Plus, Check } from 'lucide-react';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

interface AntiGravityCartItemProps {
    item: CartItem;
}

export default function AntiGravityCartItem({ item }: AntiGravityCartItemProps) {
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const toggleItemSelection = useCartStore((state) => state.toggleItemSelection);
    const [deliveryEstimate, setDeliveryEstimate] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (item.stockStatus === 'pre-order') {
            fetch('/api/delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productName: item.name, stockStatus: item.stockStatus }),
            })
                .then(res => res.json())
                .then(data => setDeliveryEstimate(data.estimation))
                .catch(() => setDeliveryEstimate('7-14 хоногт ирнэ'));
        }
    }, [item.id, item.stockStatus, item.name]);

    const isPreOrder = item.stockStatus === 'pre-order';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -50 }}
            whileHover={{ y: -4 }}
            className={`relative mb-4 overflow-hidden rounded-[28px] border transition-all duration-500 ${item.selected
                ? isPreOrder
                    ? 'bg-purple-50/10 border-purple-200 shadow-[0_12px_30px_rgba(168,85,247,0.08)]'
                    : 'bg-white border-blue-200 shadow-[0_12px_30px_rgba(0,106,255,0.08)]'
                : 'bg-white/40 backdrop-blur-md border-white/20 shadow-sm'
                }`}
        >
            <div className="flex items-center p-4 gap-4">
                {/* Selection Checkbox - Anti-gravity style */}
                <button
                    onClick={() => toggleItemSelection(item.id)}
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${item.selected
                        ? isPreOrder ? 'bg-purple-600 border-purple-600 shadow-lg shadow-purple-500/30' : 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30'
                        : 'border-slate-300 bg-white/50'
                        }`}
                >
                    {item.selected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                </button>

                {/* Product Image */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                    <Image
                        src={item.image || '/soyol-logo.png'}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                    />
                    {/* Status Badge Over Image - Refined Style */}
                    <div className="absolute top-1 left-1 z-10 pointer-events-none">
                        {isPreOrder ? (
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="px-1.5 py-0.5 bg-white/60 backdrop-blur-md text-blue-600 rounded-md border border-white/20 flex items-center gap-1 shadow-sm pointer-events-auto cursor-help"
                            >
                                <span className="text-[8px] leading-none">✈</span>
                                <span className="text-[7px] font-black uppercase tracking-tight">ЗАХИАЛГААР</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: [-1, 1, -1] }}
                                className="px-1.5 py-0.5 bg-white/60 backdrop-blur-md text-emerald-600 rounded-md border border-white/20 flex items-center gap-1 shadow-sm pointer-events-auto cursor-help"
                            >
                                <span className="text-[7px] leading-none">⚡</span>
                                <span className="text-[7px] font-black uppercase tracking-tight">БЭЛЭН</span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate mb-1">{item.name}</h3>

                    {/* Delivery Estimate (Gemini Powered) */}
                    {isPreOrder && deliveryEstimate && (
                        <p className="text-[10px] font-medium text-purple-600 bg-purple-50/50 rounded-lg p-2 mb-2 italic">
                            {deliveryEstimate}
                        </p>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isPreOrder ? 'text-purple-600 bg-purple-50 border-purple-100/50' : 'text-blue-600 bg-blue-50 border-blue-100/50'}`}>
                            {item.category}
                        </span>
                    </div>

                    <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Price</p>
                            <p className="text-xl font-bold text-orange-500">{formatPrice(item.price)}</p>
                        </div>

                        {/* Quantity Controls - Premium Style */}
                        <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-inner">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${item.quantity <= 1 ? 'text-slate-300' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-[#FF5000]'}`}
                                disabled={item.quantity <= 1}
                            >
                                <Minus className="w-4 h-4" />
                            </motion.button>
                            <span className="w-10 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-600 hover:bg-white hover:shadow-sm hover:text-[#FF5000] transition-all"
                            >
                                <Plus className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Remove Button */}
                <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Decorative Glow */}
            {item.selected && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
            )}
        </motion.div>
    );
}

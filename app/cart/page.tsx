'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Check, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import AntiGravityCartItem from '@/components/cart/AntiGravityCartItem';
import TaobaoStickyFooter from '@/components/cart/TaobaoStickyFooter';

export default function CartPage() {
    const { items } = useCartStore();
    const { t } = useTranslation();

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] pt-24 pb-16 flex flex-col items-center justify-center px-4 overflow-hidden relative">
                {/* Abstract Background Shapes */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-100/40 rounded-full blur-[100px] -z-10 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-100/40 rounded-full blur-[100px] -z-10 animate-pulse" />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="text-center relative"
                >
                    <div className="group relative w-48 h-48 mx-auto mb-8">
                        <motion.div
                            animate={{
                                rotate: [0, 5, -5, 0],
                                y: [0, -10, 0]
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-full bg-white rounded-[60px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-center border border-white relative z-10"
                        >
                            <ShoppingBag className="w-24 h-24 text-slate-100 group-hover:text-orange-100 transition-colors duration-500" strokeWidth={0.5} />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute w-12 h-12 bg-orange-500/20 rounded-full blur-xl"
                            />
                        </motion.div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-900/5 blur-xl rounded-full" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Таны сагс хоосон байна</h2>
                    <p className="text-slate-400 text-sm mb-12 uppercase tracking-[0.2em] font-black max-w-xs mx-auto leading-loose">
                        Та сонирхсон бараагаа сагсандаа нэмж эхлээрэй
                    </p>

                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,80,0,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            className="px-12 py-5 bg-gradient-to-r from-[#FF7900] to-[#FF5000] text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/40 transition-all"
                        >
                            Дэлгүүр хэсэх
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    const readyItems = items.filter(i => (i.stockStatus || 'in-stock') === 'in-stock');
    const preOrderItems = items.filter(i => i.stockStatus === 'pre-order');

    return (
        <div className="min-h-screen bg-[#FDFEFE] pt-24 pb-32">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header with Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{t('cart', 'title')}</h1>
                        <p className="text-[10px] font-black text-[#FF5000] uppercase tracking-[0.2em] mt-1 bg-orange-50 px-2 py-0.5 rounded-full inline-block">
                            Нийт {items.length} бараа
                        </p>
                    </div>
                    <Link href="/">
                        <motion.div
                            whileHover={{ x: -4 }}
                            className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400 hover:text-[#FF5000] transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Cart Sections */}
                <div className="space-y-10">
                    {/* Ready to Ship Section */}
                    {readyItems.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Бэлэн байгаа бараанууд</h2>
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black border border-emerald-100/50 ml-auto flex items-center gap-1">
                                    <Check className="w-3 h-3" strokeWidth={3} /> Маргааш хүргэгдэнэ
                                </span>
                            </div>
                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {readyItems.map((item) => (
                                        <AntiGravityCartItem key={item.id} item={item} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>
                    )}

                    {/* Pre-order Section */}
                    {preOrderItems.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Захиалгын бараанууд</h2>
                                <span className="text-[10px] bg-blue-50 text-blue-500 px-3 py-1 rounded-full font-black border border-blue-100/50 ml-auto flex items-center gap-1">
                                    <Clock className="w-3 h-3" strokeWidth={3} /> 14 хоногт ирнэ
                                </span>
                            </div>
                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {preOrderItems.map((item) => (
                                        <AntiGravityCartItem key={item.id} item={item} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>
                    )}
                </div>

                {/* Recommendation Guide */}
                <div className="mt-16">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Танд таалагдаж магадгүй</h3>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pb-10">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="aspect-[3/4] bg-white rounded-[32px] border border-slate-100/50 shadow-sm animate-pulse flex flex-col p-4 gap-3"
                            >
                                <div className="flex-1 bg-slate-50 rounded-2xl" />
                                <div className="h-3 w-3/4 bg-slate-50 rounded-full" />
                                <div className="h-4 w-1/2 bg-slate-50 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Footer */}
            <TaobaoStickyFooter />
        </div>
    );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3, Package, Tag, Layers, ShoppingCart, MessageCircle,
    ArrowLeft, Menu, X, Building2
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const navItems = [
    { href: '/admin', icon: BarChart3, label: 'Хяналтын самбар' },
    { href: '/admin/products', icon: Package, label: 'Бүтээгдэхүүн' },
    { href: '/admin/attributes', icon: Tag, label: 'Шинж чанар' },
    { href: '/admin/categories', icon: Layers, label: 'Ангилал' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Захиалгууд' },
    { href: '/admin/stores', icon: Building2, label: 'Дэлгүүрүүд' },
    { href: '/admin/messages', icon: MessageCircle, label: 'Мессеж & Дуудлага' },
];

// Products button points to /admin since the product management is on the main admin page
const ADMIN_ROUTES: Record<string, string> = {
    '/admin/products': '/admin',
};

export default function AdminSidebar() {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (href: string) => {
        // Special case: /admin only matches exactly, not sub-paths
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname === href || pathname.startsWith(href + '/');
    };

    const SidebarContent = () => (
        <div className="h-full flex flex-col p-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="text-white font-black text-xl">S</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white leading-none">Soyol</h2>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Admin Panel</p>
                </div>
                {/* Close button (mobile only) */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 space-y-1.5">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                                ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 shadow-lg shadow-amber-500/5'
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                                }`}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            <span className="text-sm font-bold">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="pt-6 border-t border-white/5">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">Сайт руу буцах</span>
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="fixed top-4 left-4 z-30 p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors lg:hidden shadow-lg"
                aria-label="Open sidebar"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Sidebar (Desktop: always visible; Mobile: drawer) */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/10 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <SidebarContent />
            </aside>
        </>
    );
}

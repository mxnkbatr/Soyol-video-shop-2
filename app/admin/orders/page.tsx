'use client'; // Force redeploy v2

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft, Loader2, Package, Search,
    MapPin, Phone, Clock, CheckCircle2, Truck, AlertCircle, ChevronRight,
    Menu, X, BarChart3, ShoppingCart, MessageCircle, Tag, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { mn } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface Order {
    _id: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    notes?: string;
    items: OrderItem[];
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'delivered';
    createdAt: string;
    deliveryEstimate?: string;
}

type OrderStatus = Order['status'];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'delivered'>('all');
    const [quickUpdating, setQuickUpdating] = useState<string | null>(null);

    // Edit form state for modal
    const [editStatus, setEditStatus] = useState<OrderStatus>('pending');
    const [editEstimate, setEditEstimate] = useState('');
    const [updating, setUpdating] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/admin/orders');
            const data = await response.json();
            if (data.orders) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
            toast.error('Захиалга ачаалахад алдаа гарлаа');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, estimate?: string) => {
        // Optimistic UI update
        const previousOrders = [...orders];
        setOrders(current => current.map(order =>
            order._id === orderId ? { ...order, status: newStatus, deliveryEstimate: estimate || order.deliveryEstimate } : order
        ));

        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    status: newStatus,
                    deliveryEstimate: estimate || ''
                })
            });

            if (!res.ok) throw new Error('Update failed');
            toast.success('Төлөв шинэчлэгдлээ');
        } catch (error) {
            setOrders(previousOrders);
            toast.error('Алдаа гарлаа');
        }
    };

    const handleQuickStatus = async (orderId: string, newStatus: OrderStatus) => {
        setQuickUpdating(orderId);
        await updateOrderStatus(orderId, newStatus);
        setQuickUpdating(null);
    };

    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setEditStatus(order.status);

        // Auto-set delivery estimate if not set
        if (!order.deliveryEstimate) {
            const hasPreOrder = order.items.some((item: any) => item.stockStatus === 'pre-order');
            setEditEstimate(hasPreOrder ? '7-14 хоногт ирнэ' : 'Маргааш хүргэнэ');
        } else {
            setEditEstimate(order.deliveryEstimate);
        }

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleModalUpdate = async () => {
        if (!selectedOrder) return;
        setUpdating(true);
        await updateOrderStatus(selectedOrder._id, editStatus, editEstimate);
        setUpdating(false);
        closeModal();
    };

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('mn-MN', { maximumFractionDigits: 0 }).format(n) + ' ₮';

    const getStatusBadgeClass = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
            case 'confirmed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        }
    };

    const getStatusLabel = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return 'Шинэ';
            case 'confirmed': return 'Баталгаажсан';
            case 'delivered': return 'Хүргэгдсэн';
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o => o.status === activeTab)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [orders, activeTab]);

    const counts = useMemo(() => ({
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
    }), [orders]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex">
            {/* Sidebar Overlay (Mobile) */}
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

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/10 transform transition-transform duration-300 ease-in-out
                lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
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
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 space-y-1.5">
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <BarChart3 className="w-5 h-5" />
                            <span className="text-sm font-bold">Хяналтын самбар</span>
                        </Link>
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Package className="w-5 h-5" />
                            <span className="text-sm font-bold">Бүтээгдэхүүн</span>
                        </Link>
                        <Link href="/admin/attributes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Tag className="w-5 h-5" />
                            <span className="text-sm font-bold">Шинж чанар</span>
                        </Link>
                        <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Layers className="w-5 h-5" />
                            <span className="text-sm font-bold">Ангилал</span>
                        </Link>
                        <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 transition-all shadow-lg shadow-amber-500/5">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="text-sm font-bold">Захиалгууд</span>
                        </Link>
                        <Link href="/admin/messages" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm font-bold">Мессеж & Дуудлага</span>
                        </Link>
                    </nav>

                    {/* Bottom */}
                    <div className="pt-6 border-t border-white/5">
                        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold">Сайт руу буцах</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 lg:hidden transition-colors"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 lg:hidden">
                                        <ShoppingCart className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold tracking-tight">Захиалга удирдах</h1>
                                        <p className="text-xs text-slate-400 lg:block hidden">Захиалгын явц болон төлөв</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-auto overflow-x-auto max-w-full scrollbar-hide">
                                {(['pending', 'confirmed', 'delivered'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setActiveTab(status)}
                                        className={`px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === status
                                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                            : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {getStatusLabel(status)}
                                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === status ? 'bg-white/20' : 'bg-white/5'
                                            }`}>
                                            {counts[status]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-hide">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                            <p className="text-sm text-slate-500 font-medium">Ачаалж байна...</p>
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto space-y-4">
                            {filteredOrders.length === 0 ? (
                                <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Захиалга байхгүй байна</h3>
                                    <p className="text-sm text-slate-500 mt-1">Энэ ангилалд одоогоор захиалга алга.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="text-left border-b border-white/10">
                                                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Дугаар</th>
                                                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Захиалагч</th>
                                                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Огноо</th>
                                                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Төлөв</th>
                                                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Нийт дүн</th>
                                                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Үйлдэл</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredOrders.map((order) => (
                                                <tr key={order._id} className="group hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-mono text-xs text-slate-400">
                                                        #{order._id.slice(-6).toUpperCase()}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-white text-sm">{order.fullName}</div>
                                                        <div className="text-xs text-slate-500">{order.phone}</div>
                                                    </td>
                                                    <td className="p-4 text-xs text-slate-400">
                                                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: mn })}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(order.status)}`}>
                                                            {getStatusLabel(order.status)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-bold text-amber-500 text-sm">
                                                        {formatPrice(order.totalPrice)}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            {order.status === 'pending' && (
                                                                <button
                                                                    onClick={() => handleQuickStatus(order._id, 'confirmed')}
                                                                    disabled={quickUpdating === order._id}
                                                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 whitespace-nowrap"
                                                                >
                                                                    {quickUpdating === order._id ? <Loader2 className="w-3 h-3 animate-spin" /> : '✓ Баталгаажуулах'}
                                                                </button>
                                                            )}
                                                            {order.status === 'confirmed' && (
                                                                <button
                                                                    onClick={() => handleQuickStatus(order._id, 'delivered')}
                                                                    disabled={quickUpdating === order._id}
                                                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 whitespace-nowrap"
                                                                >
                                                                    {quickUpdating === order._id ? <Loader2 className="w-3 h-3 animate-spin" /> : '🚚 Хүргэгдсэн'}
                                                                </button>
                                                            )}
                                                            {order.status === 'delivered' && (
                                                                <span className="text-emerald-500 font-bold text-lg">✓</span>
                                                            )}
                                                            <button
                                                                onClick={() => openOrderDetails(order)}
                                                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Detail Modal - Keep existing modal structure but refined */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#1E293B] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#1E293B] z-10">
                            <div>
                                <h2 className="text-xl font-bold text-white">Захиалгын дэлгэрэнгүй</h2>
                                <p className="text-xs text-slate-500 font-mono mt-1">ID: {selectedOrder._id}</p>
                            </div>
                            <button onClick={closeModal} className="p-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Customer & Shipping */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Хэрэглэгч</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400"><Search className="w-4 h-4" /></div>
                                            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Нэр</p><p className="text-sm font-bold text-white">{selectedOrder.fullName}</p></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400"><Phone className="w-4 h-4" /></div>
                                            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Утас</p><p className="text-sm font-bold text-white">{selectedOrder.phone}</p></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Хүргэлт</h4>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 shrink-0"><MapPin className="w-4 h-4" /></div>
                                        <div><p className="text-[10px] text-slate-500 font-bold uppercase">Хаяг</p><p className="text-sm text-slate-300 leading-relaxed">{selectedOrder.city}, {selectedOrder.district}<br />{selectedOrder.address}</p></div>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Бараанууд ({selectedOrder.items.length})</h4>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 shrink-0">
                                                    <Image src={item.image || '/soyol-logo.png'} alt={item.name || 'Product Image'} fill className="object-contain p-1" />
                                                </div>
                                                <div><p className="text-sm font-bold text-white line-clamp-1">{item.name}</p><p className="text-xs text-slate-500">{item.quantity} x {formatPrice(item.price)}</p></div>
                                            </div>
                                            <div className="text-sm font-black text-white">{formatPrice(item.price * item.quantity)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Update Form */}
                            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-4">
                                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Төлөв шинэчлэх</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1.5">Захиалгын төлөв</label>
                                        <select
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-amber-500/20 outline-none"
                                        >
                                            <option value="pending">Хүлээгдэж байна</option>
                                            <option value="confirmed">Баталгаажсан</option>
                                            <option value="delivered">Хүргэгдсэн</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1.5">Хүргэлтийн хугацаа</label>
                                        <input
                                            type="text"
                                            value={editEstimate}
                                            onChange={(e) => setEditEstimate(e.target.value)}
                                            placeholder="Жишээ: Маргааш хүргэнэ"
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-amber-500/20 outline-none placeholder:text-slate-600 mb-2"
                                        />
                                        <div className="flex flex-wrap gap-1.5">
                                            <button
                                                onClick={() => setEditEstimate('Өнөөдөр хүргэнэ')}
                                                className="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] rounded-md font-bold transition-colors"
                                            >
                                                Өнөөдөр хүргэнэ
                                            </button>
                                            <button
                                                onClick={() => setEditEstimate('Маргааш хүргэнэ')}
                                                className="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] rounded-md font-bold transition-colors"
                                            >
                                                Маргааш хүргэнэ
                                            </button>
                                            <button
                                                onClick={() => setEditEstimate('7 хоногт ирнэ')}
                                                className="px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-[10px] rounded-md font-bold transition-colors"
                                            >
                                                7 хоногт ирнэ
                                            </button>
                                            <button
                                                onClick={() => setEditEstimate('14 хоногт ирнэ')}
                                                className="px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-[10px] rounded-md font-bold transition-colors"
                                            >
                                                14 хоногт ирнэ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-[#1E293B] flex gap-3">
                            <button onClick={closeModal} className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all">Цуцлах</button>
                            <button
                                onClick={handleModalUpdate}
                                disabled={updating}
                                className="flex-[2] h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                                Хадгалах
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}


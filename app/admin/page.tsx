'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, PlusCircle, Pencil, Trash2, Loader2, LayoutDashboard, ArrowLeft,
  Search, Filter, TrendingUp, AlertCircle, CheckCircle, Tag, Star,
  ShoppingCart, MessageCircle, Menu, X, Globe, BarChart3, Layers, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createProduct, deleteProduct, getAllProducts, updateProduct, ProductFormData } from '@/app/actions/products';
import ImageUpload from '@/components/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

type Product = {
  _id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  sections?: string[];
  image: string | null;
  category: string;
  stockStatus: string;
  inventory?: number;
  featured?: boolean;
  brand?: string;
  model?: string;
  delivery?: string;
  paymentMethods?: string;
  createdAt: string;
  attributes?: Record<string, string>;
};

type Attribute = {
  _id: string;
  name: string;
  type: 'select' | 'text' | 'number';
  options: string[];
};

type Order = {
  _id: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: string;
};

const CATEGORIES = [
  { value: 'tech', label: 'Tech & Electronics' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'home', label: 'Home & Living' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'sports', label: 'Sports & Outdoors' },
];

const SECTIONS = [
  { id: 'Шинэ', label: 'Шинэ', icon: '🔥' },
  { id: 'Бэлэн', label: 'Бэлэн', icon: '📦' },
  { id: 'Захиалга', label: 'Захиалга', icon: '🌐' },
  { id: 'Хямдрал', label: 'Хямдрал', icon: '🏷️' },
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discountPercent: '',
    sections: [] as string[],
    image: '',
    category: 'tech',
    stockStatus: 'in-stock',
    inventory: '0',
    brand: '',
    model: '',
    delivery: 'Үнэгүй',
    paymentMethods: 'QPay, SocialPay, Card',
    attributes: {} as Record<string, string>,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDiscountFields, setShowDiscountFields] = useState(false);

  useEffect(() => {
    setShowDiscountFields(formData.sections?.includes('Хямдрал') || false);
  }, [formData.sections]);

  useEffect(() => {
    if (showDiscountFields) {
      const op = parseFloat(formData.originalPrice);
      const dp = parseFloat(formData.discountPercent);
      if (!isNaN(op) && !isNaN(dp)) {
        const salePrice = Math.round((op * (1 - dp / 100)) / 10) * 10;
        if (String(salePrice) !== formData.price) {
          setFormData(prev => ({ ...prev, price: String(salePrice) }));
        }
      }
    }
  }, [formData.originalPrice, formData.discountPercent, showDiscountFields, formData.price]);

  const fetchProducts = async () => {
    const data = await getAllProducts();
    setProducts(data || []);
  };

  const fetchAttributes = async () => {
    try {
      const res = await fetch('/api/attributes');
      if (res.ok) {
        const data = await res.json();
        setAttributes(data);
      }
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchAttributes(), fetchOrders()]);
      setLoading(false);
    })();
  }, []);

  // Calculate Statistics
  const stats = {
    totalProducts: products.length,
    totalInventory: products.reduce((acc, p) => acc + (p.inventory || 0), 0),
    lowStock: products.filter(p => (p.inventory || 0) < 5).length,
    outOfStock: products.filter(p => (p.inventory || 0) === 0).length,
    activeCategories: new Set(products.map(p => p.category)).size
  };

  const todayOrdersCount = (() => {
    const today = new Date();
    return orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
    }).length;
  })();

  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product._id);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: String(product.price),
        originalPrice: String(product.originalPrice || ''),
        discountPercent: String(product.discountPercent || ''),
        sections: product.sections || [],
        image: product.image || '',
        category: product.category,
        stockStatus: product.stockStatus,
        inventory: String(product.inventory || 0),
        brand: product.brand || '',
        model: product.model || '',
        delivery: product.delivery || 'Үнэгүй',
        paymentMethods: product.paymentMethods || 'QPay, SocialPay, Card',
        attributes: product.attributes || {}
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        discountPercent: '',
        sections: [],
        image: '',
        category: 'tech',
        stockStatus: 'in-stock',
        inventory: '0',
        brand: '',
        model: '',
        delivery: 'Үнэгүй',
        paymentMethods: 'QPay, SocialPay, Card',
        attributes: {}
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      discountPercent: '',
      sections: [],
      image: '',
      category: 'tech',
      stockStatus: 'in-stock',
      inventory: '0',
      brand: '',
      model: '',
      delivery: 'Үнэгүй',
      paymentMethods: 'QPay, SocialPay, Card',
      attributes: {}
    });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload: ProductFormData = {
      name: formData.name,
      description: formData.description || '',
      price: parseFloat(formData.price) || 0,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : undefined,
      sections: formData.sections,
      image: formData.image || '',
      category: formData.category,
      stockStatus: formData.stockStatus,
      inventory: parseInt(formData.inventory) || 0,
      brand: formData.brand,
      model: formData.model,
      delivery: formData.delivery,
      paymentMethods: formData.paymentMethods,
      attributes: formData.attributes,
    };

    if (editingId) {
      const result = await updateProduct(editingId, payload);
      if (result.success) {
        toast.success('Бараа шинэчлэгдлээ');
        closeModal();
        fetchProducts();
      } else toast.error(result.error || 'Error');
    } else {
      const result = await createProduct(payload);
      if (result.success) {
        toast.success('Бараа нэмэгдлээ');
        closeModal();
        fetchProducts();
      } else toast.error(result.error || 'Error');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Устгах уу?')) return;
    const result = await deleteProduct(id);
    if (result.success) { toast.success('Устгагдлаа'); fetchProducts(); }
    else toast.error(result.error || 'Error');
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('mn-MN', { maximumFractionDigits: 0 }).format(n) + ' ₮';

  const handleToggleFeatured = async (product: Product) => {
    const newValue = !product.featured;
    setTogglingFeatured(product._id);
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: newValue }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p._id === product._id ? { ...p, featured: newValue } : p));
        toast.success(newValue ? 'Онцгой болголоо ⭐' : 'Онцгой-оос хаслаа');
      } else {
        toast.error('Алдаа гарлаа');
      }
    } catch {
      toast.error('Сервертэй холбогдож чадсангүй');
    } finally {
      setTogglingFeatured(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
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
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 transition-all shadow-lg shadow-amber-500/5">
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
            <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 lg:hidden transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 lg:hidden">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">Бүтээгдэхүүн</h1>
                    <p className="text-xs text-slate-400 lg:block hidden">Бараа материалын удирдлага</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium shadow-lg shadow-amber-500/20 text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Бараа нэмэх</span>
                <span className="sm:hidden">Нэмэх</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 scrollbar-hide">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /></div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Өнөөдрийн захиалга */}
                <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShoppingCart className="w-16 h-16 text-blue-500" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium">Өнөөдрийн захиалга</p>
                    <h3 className="text-3xl font-bold text-white mt-1">
                      {ordersLoading ? <span className="inline-flex items-center"><Loader2 className="w-5 h-5 animate-spin mr-2" />...</span> : todayOrdersCount}
                    </h3>
                    <div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      <span>Өнөөдөр</span>
                    </div>
                  </div>
                </div>

                {/* Нийт орлого */}
                <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-16 h-16 text-emerald-500" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium">Нийт орлого</p>
                    <h3 className="text-3xl font-bold text-white mt-1">
                      {ordersLoading ? <span className="inline-flex items-center"><Loader2 className="w-5 h-5 animate-spin mr-2" />...</span> : formatPrice(totalRevenue)}
                    </h3>
                    <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Хүргэгдсэн захиалга</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Package className="w-16 h-16 text-amber-500" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium">Нийт бүтээгдэхүүн</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{stats.totalProducts}</h3>
                    <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Идэвхтэй зарагдаж байна</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Tag className="w-16 h-16 text-blue-500" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium">Нийт төрөл</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{stats.activeCategories}</h3>
                    <div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Категориуд</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Package className="w-16 h-16 text-emerald-500" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium">Нийт үлдэгдэл</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{stats.totalInventory}</h3>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                      <span>Агуулахад байгаа тоо</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium">Дуусч байгаа</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{stats.lowStock}</h3>
                    <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{stats.outOfStock} бараа дууссан</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/10">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Бараа хайх..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterCategory === 'all' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    Бүгд
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setFilterCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterCategory === cat.value ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product List */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800/50 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10">
                        <th className="px-6 py-4">Зураг</th>
                        <th className="px-6 py-4">Нэр & Төрөл</th>
                        <th className="px-6 py-4">Үнэ</th>
                        <th className="px-6 py-4">Үлдэгдэл</th>
                        <th className="px-6 py-4">Төлөв</th>
                        <th className="px-6 py-4 text-center">Онцгой</th>
                        <th className="px-6 py-4 text-right">Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => (
                          <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-800 ring-1 ring-white/10">
                                {p.image ? (
                                  <Image src={p.image} alt="" fill className="object-cover" sizes="48px" />
                                ) : (
                                  <Package className="w-5 h-5 text-slate-600 absolute inset-0 m-auto" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-white line-clamp-1">{p.name}</div>
                              <div className="text-xs text-slate-500">{CATEGORIES.find(c => c.value === p.category)?.label || p.category}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-amber-400 font-medium text-sm">{formatPrice(p.price)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${(p.inventory || 0) < 5 ? 'text-red-400' : 'text-slate-300'}`}>
                                  {p.inventory || 0}
                                </span>
                                {(p.inventory || 0) < 5 && (
                                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(p.inventory || 0) > 0 ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'}`}>
                                {(p.inventory || 0) > 0 ? 'Бэлэн' : 'Дууссан'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleToggleFeatured(p)}
                                disabled={togglingFeatured === p._id}
                                className={`p-2 rounded-lg transition-all duration-200 ${p.featured ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-white/5 text-slate-600 hover:text-slate-300 hover:bg-white/10'} disabled:opacity-50`}
                                title={p.featured ? 'Онцгой-оос хасах' : 'Онцгой болгох'}
                              >
                                {togglingFeatured === p._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-400' : ''}`} />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openModal(p)}
                                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                                  title="Засах"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(p._id)}
                                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                  title="Устгах"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                            Бараа олдсонгүй.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <div key={p._id} className="bg-slate-800/50 rounded-xl p-4 border border-white/5 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-800 ring-1 ring-white/10 flex-shrink-0">
                            {p.image ? (
                              <Image src={p.image} alt="" fill className="object-cover" sizes="64px" />
                            ) : (
                              <Package className="w-6 h-6 text-slate-600 absolute inset-0 m-auto" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">{p.name}</h3>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleToggleFeatured(p)}
                                  disabled={togglingFeatured === p._id}
                                  className={`p-1.5 rounded-lg transition-colors ${p.featured ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400 hover:text-amber-400'} disabled:opacity-50`}
                                >
                                  {togglingFeatured === p._id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Star className={`w-3.5 h-3.5 ${p.featured ? 'fill-amber-400' : ''}`} />
                                  )}
                                </button>
                                <button
                                  onClick={() => openModal(p)}
                                  className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(p._id)}
                                  className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{CATEGORIES.find(c => c.value === p.category)?.label || p.category}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-amber-400 font-bold text-sm">{formatPrice(p.price)}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs ${(p.inventory || 0) < 5 ? 'text-red-400' : 'text-slate-400'}`}>
                                  {p.inventory || 0} ширхэг
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${(p.inventory || 0) > 0 ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'}`}>
                                  {(p.inventory || 0) > 0 ? 'Бэлэн' : 'Дууссан'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-sm">
                      Бараа олдсонгүй.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
                <h2 className="text-xl font-bold text-white">{editingId ? 'Бараа засах' : 'Бараа нэмэх'}</h2>
                <button onClick={closeModal} className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                  <span className="sr-only">Close</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Нэр *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all" placeholder="Барааны нэр" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Тайлбар</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-slate-600 focus:border-amber-500/50 outline-none resize-none transition-all" placeholder="Тайлбар" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Харагдах хэсэг</label>
                    <div className="flex flex-wrap gap-2">
                      {SECTIONS.map((section) => {
                        const isSelected = formData.sections.includes(section.id);
                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => {
                              const newSections = isSelected
                                ? formData.sections.filter(id => id !== section.id)
                                : [...formData.sections, section.id];
                              setFormData({ ...formData, sections: newSections });
                            }}
                            className={`px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-2 ${isSelected
                              ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                              : 'bg-slate-800 border-white/10 text-slate-400 hover:border-white/20'
                              }`}
                          >
                            <span>{section.icon}</span>
                            <span>{section.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={showDiscountFields ? "md:col-span-1" : "md:col-span-2"}>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {showDiscountFields ? 'Хямдралтай үнэ *' : 'Үнэ *'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        readOnly={showDiscountFields}
                        min={0}
                        className={`w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all ${showDiscountFields ? 'bg-slate-900/50 text-orange-400 font-bold' : ''}`}
                        placeholder="0"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₮</span>
                    </div>
                    {showDiscountFields && (
                      <p className="text-[10px] text-slate-500 mt-1">Автоматаар тооцоологдсон</p>
                    )}
                  </div>

                  {showDiscountFields && (
                    <div className="grid grid-cols-2 gap-4 md:col-span-2 bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 italic">Анхны үнэ *</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.originalPrice}
                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                            required={showDiscountFields}
                            min={0}
                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all"
                            placeholder="49900"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₮</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 italic">Хямдралын хувь % *</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.discountPercent}
                            onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                            required={showDiscountFields}
                            min={1}
                            max={99}
                            className="w-full pl-4 pr-8 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all"
                            placeholder="20"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                        </div>
                      </div>

                      {formData.originalPrice && formData.discountPercent && (
                        <div className="col-span-2 text-xs font-bold text-orange-500 mt-1 flex items-center gap-2">
                          <Zap className="w-3 h-3" />
                          <span>
                            {parseInt(formData.originalPrice).toLocaleString()}₮ → {parseInt(formData.price).toLocaleString()}₮ ({formData.discountPercent}% хямдрал)
                          </span>
                        </div>
                      )}
                    </div>
                  )}


                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Үлдэгдэл *</label>
                    <input type="number" value={formData.inventory} onChange={(e) => setFormData({ ...formData, inventory: e.target.value })} required min={0} className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all" placeholder="0" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Төлөв</label>
                    <select value={formData.stockStatus} onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none appearance-none cursor-pointer">
                      <option value="in-stock">Бэлэн (In Stock)</option>
                      <option value="out-of-stock">Дууссан (Out of Stock)</option>
                      <option value="pre-order">Захиалгаар (Pre-order)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Төрөл</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none appearance-none cursor-pointer">
                      {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Брэнд</label>
                    <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all" placeholder="Жишээ: Lighting" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Загвар</label>
                    <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all" placeholder="Жишээ: Aputure 120d II" />
                  </div>



                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Хүргэлт</label>
                    <input type="text" value={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all" placeholder="Жишээ: Үнэгүй" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Төлбөрийн нөхцөл</label>
                    <input type="text" value={formData.paymentMethods} onChange={(e) => setFormData({ ...formData, paymentMethods: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all" placeholder="Жишээ: QPay, SocialPay, Card" />
                  </div>

                  {/* Dynamic Attributes */}
                  {attributes.length > 0 && (
                    <div className="md:col-span-2 border-t border-white/10 pt-4 mt-2">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">Нэмэлт шинж чанарууд</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {attributes.map((attr) => (
                          <div key={attr._id}>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{attr.name}</label>
                            {attr.type === 'select' ? (
                              <div className="relative">
                                <select
                                  value={formData.attributes?.[attr._id] || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    attributes: { ...formData.attributes, [attr._id]: e.target.value }
                                  })}
                                  className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none appearance-none cursor-pointer"
                                >
                                  <option value="">Сонгох...</option>
                                  {attr.options.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <input
                                type={attr.type === 'number' ? 'number' : 'text'}
                                value={formData.attributes?.[attr._id] || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  attributes: { ...formData.attributes, [attr._id]: e.target.value }
                                })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all"
                                placeholder={attr.name}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Зургийн URL</label>
                    <ImageUpload
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                      onRemove={() => setFormData({ ...formData, image: '' })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10 mt-2">
                  <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 font-medium transition-all">Цуцлах</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {editingId ? 'Хадгалах' : 'Нэмэх'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

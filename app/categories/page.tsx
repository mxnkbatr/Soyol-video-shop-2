'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, ShoppingCart, Eye, ChevronDown, Sparkles } from 'lucide-react';
import { formatPrice, getStarRating, formatCurrency } from '@lib/utils';
import { useCartStore } from '@store/cartStore';
import toast from 'react-hot-toast';
import type { Product } from '@models/Product';
import type { Category } from '@models/Category';

interface Attribute {
  _id: string;
  name: string;
  type: 'select' | 'text' | 'number';
  options: string[];
}

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  // Fetch products, categories, and attributes from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, attributesRes] = await Promise.all([
          fetch('/api/products?limit=100'),
          fetch('/api/categories'),
          fetch('/api/attributes'),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const attributesData = await attributesRes.json();

        // API returns { products, nextCursor, hasMore }
        setProducts(productsData.products || []);
        setCategories(categoriesData);
        setAttributes(attributesData);
      } catch (error) {
        // Silently handle error
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((product: Product) => {
    // Category Filter
    if (selectedCategory !== 'all') {
      if (product.category !== selectedCategory) return false;
    }

    // Attribute Filters
    for (const [attrId, value] of Object.entries(selectedAttributes)) {
      if (value && product.attributes?.[attrId] !== value) {
        return false;
      }
    }

    return true;
  });

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`${product.name} сагсанд нэмэгдлээ!`, {
      duration: 2000,
      position: 'top-right',
      style: {
        background: '#FF7900',
        color: 'white',
        fontWeight: 'bold',
        borderRadius: '12px',
      },
      icon: '🛒',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-soyol mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Header - Hidden on Mobile */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden lg:block mb-8"
        >
          <h1 className="text-4xl font-black text-gray-900 mb-2">Бүх ангилал</h1>
          <p className="text-gray-600">
            {filteredProducts.length} бараа олдлоо
          </p>
        </motion.div>

        {/* Mobile Taobao Style Layout - Refined */}
        <div className="lg:hidden fixed inset-0 top-[60px] pb-[70px] flex bg-white z-40">
          {/* Left Sidebar - Categories (Apple Minimalist) */}
          <div className="w-24 flex-shrink-0 bg-gray-50/50 overflow-y-auto scrollbar-hide border-r border-gray-100">
            <div className="flex flex-col py-6 gap-6">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                }}
                className={`relative py-2 px-1 text-center transition-all group ${selectedCategory === 'all'
                  ? 'text-gray-900'
                  : 'text-gray-400'}`}
              >
                <div className={`mx-auto w-10 h-10 mb-2 rounded-full flex items-center justify-center transition-all ${selectedCategory === 'all' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>
                   <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-medium">Бүгд</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory('all');
                  }}
                  className={`relative py-2 px-1 text-center transition-all group ${selectedCategory === cat.id
                    ? 'text-gray-900'
                    : 'text-gray-400'}`}
                >
                  <div className={`mx-auto w-10 h-10 mb-2 rounded-full flex items-center justify-center transition-all ${selectedCategory === cat.id ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>
                    {/* Placeholder Icons - Replace with actual category icons if available */}
                    <Filter className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-medium leading-relaxed line-clamp-2">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto bg-white p-6 pb-24 scroll-smooth">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-8"
              >
                {/* Banner Placeholder */}
                <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-lg shadow-gray-200">
                  <Image
                    src={selectedCategory === 'all' ? '/soyol-logo.png' : categories.find(c => c.id === selectedCategory)?.image || '/soyol-logo.png'}
                    alt="Category Banner"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent p-4 flex flex-col justify-center">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest">
                      {selectedCategory === 'all' ? 'Шинэ бараанууд' : categories.find(c => c.id === selectedCategory)?.name}
                    </h3>
                    <p className="text-white/80 text-[10px] font-bold mt-1 uppercase tracking-tighter">Хямдрал 20% хүртэл</p>
                  </div>
                </div>

                {/* Subcategories Grid (Circular) */}
                {selectedCategory !== 'all' && categories.find(c => c.id === selectedCategory)?.subcategories && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Дэд ангилал</h4>
                      <Link href={`/category/${selectedCategory}`} className="text-[10px] font-black text-[#FF5000] uppercase tracking-widest">Бүгдийг харах</Link>
                    </div>
                    <div className="grid grid-cols-3 gap-y-6">
                      {categories.find(c => c.id === selectedCategory)?.subcategories?.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubcategory(sub.id)}
                          className="flex flex-col items-center gap-2 group"
                        >
                          <div className={`w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border-2 transition-all ${selectedSubcategory === sub.id ? 'border-[#FF5000] shadow-lg shadow-orange-100' : 'border-transparent group-active:scale-95'}`}>
                            <div className="text-xl grayscale opacity-80 group-active:grayscale-0 group-active:opacity-100 transition-all">
                              {/* Using random icon/letter for subcats since data is mocked */}
                              {sub.name[0]}
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold text-center leading-tight transition-colors ${selectedSubcategory === sub.id ? 'text-[#FF5000]' : 'text-gray-500'}`}>
                            {sub.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Products Header */}
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-medium text-gray-900">Онцлох бараа</h4>
                    <span className="text-[10px] text-gray-400">{filteredProducts.length} бараа</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.slice(0, 16).map((product) => (
                      <Link key={product.id} href={`/product/${product.id}`} className="group active:scale-95 transition-transform">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                          <div className="relative aspect-square bg-gray-50">
                            <Image src={product.image || '/soyol-logo.png'} alt={product.name} fill className="object-cover" />
                            {product.stockStatus === 'pre-order' && (
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full">Захиалга</div>
                            )}
                          </div>
                          <div className="p-3">
                            <h5 className="text-xs font-medium text-gray-800 line-clamp-2 leading-relaxed h-8 mb-1">{product.name}</h5>
                            <p className="text-sm font-semibold text-black">
                              {formatCurrency(product.price)}₮
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Existing Content - Hidden on Mobile */}
        <div className="hidden lg:flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="w-5 h-5 text-soyol" />
                <h2 className="text-xl font-bold text-gray-900">Шүүлтүүр</h2>
              </div>

              {/* All Products */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition mb-2 ${selectedCategory === 'all'
                  ? 'bg-soyol text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-soyol/10'
                  }`}
              >
                Бүх бараа
              </button>

              {/* Categories */}
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => {
                        if (selectedCategory === category.id) {
                          setExpandedCategory(
                            expandedCategory === category.id ? null : category.id
                          );
                        } else {
                          setSelectedCategory(category.id);
                          setSelectedSubcategory('all');
                          setExpandedCategory(category.id);
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center justify-between ${selectedCategory === category.id
                        ? 'bg-soyol text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-soyol/10'
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {/* Subcategories */}
                    {expandedCategory === category.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 mt-2 space-y-1"
                      >
                        {category.subcategories?.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubcategory(sub.id)}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${selectedSubcategory === sub.id
                              ? 'bg-soyol/20 text-soyol font-bold'
                              : 'text-gray-600 hover:bg-gray-100'
                              }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* Dynamic Attribute Filters */}
              {attributes.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Шинж чанараар шүүх</h3>
                  <div className="space-y-4">
                    {attributes.map((attr) => (
                      <div key={attr._id}>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">{attr.name}</label>
                        {attr.type === 'select' ? (
                          <div className="relative">
                            <select
                              value={selectedAttributes[attr._id] || ''}
                              onChange={(e) => {
                                const newAttrs = { ...selectedAttributes };
                                if (e.target.value === '') {
                                  delete newAttrs[attr._id];
                                } else {
                                  newAttrs[attr._id] = e.target.value;
                                }
                                setSelectedAttributes(newAttrs);
                              }}
                              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-soyol/20 focus:border-soyol appearance-none cursor-pointer"
                            >
                              <option value="">Бүгд</option>
                              {attr.options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        ) : (
                          <input
                            type={attr.type === 'number' ? 'number' : 'text'}
                            placeholder={`${attr.name}-ар хайх...`}
                            value={selectedAttributes[attr._id] || ''}
                            onChange={(e) => {
                              const newAttrs = { ...selectedAttributes };
                              if (e.target.value === '') {
                                delete newAttrs[attr._id];
                              } else {
                                newAttrs[attr._id] = e.target.value;
                              }
                              setSelectedAttributes(newAttrs);
                            }}
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-soyol/20 focus:border-soyol"
                          />
                        )}
                      </div>
                    ))}

                    {Object.keys(selectedAttributes).length > 0 && (
                      <button
                        onClick={() => setSelectedAttributes({})}
                        className="w-full mt-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      >
                        Шүүлтүүр арилгах
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Price Range Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2 font-bold">Үнийн хязгаар</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-bold text-soyol">
                    {formatPrice(Math.min(...filteredProducts.map((p) => p.price)))}
                  </span>
                  <span>-</span>
                  <span className="font-bold text-soyol">
                    {formatPrice(Math.max(...filteredProducts.map((p) => p.price)))}
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Right - Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Энэ ангилалд бараа олдсонгүй</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition group"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Image
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {product.wholesale && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-soyol rounded-full text-xs font-bold text-white">
                          Бөөний үнэ
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <a href={`/product/${product.id}`}>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 hover:text-soyol transition">
                          {product.name}
                        </h3>
                      </a>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {getStarRating(product.rating ?? 0).map((filled, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${filled ? 'fill-current text-soyol' : 'fill-current text-gray-300'
                              }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                      </div>

                      {/* Price */}
                      <p className="text-2xl font-black text-soyol tracking-tighter">
                        {formatCurrency(product.price)}
                        <span className="text-sm ml-0.5 tracking-normal">₮</span>
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 py-2 bg-soyol text-white font-bold rounded-xl shadow-lg glow-orange flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="text-sm">Сагсанд</span>
                        </button>

                        <a
                          href={`/product/${product.id}`}
                          className="px-4 py-2 bg-white border-2 border-soyol text-soyol font-bold rounded-xl hover:bg-soyol hover:text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

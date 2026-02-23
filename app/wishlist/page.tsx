'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import SignInRequired from '@/components/auth/SignInRequired';

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId);
    toast.success(`${productName} хасагдлаа`, {
      duration: 2000,
      position: 'top-right',
      icon: '💔',
      style: {
        borderRadius: '999px',
        padding: '12px 20px',
      },
    });
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success('Сагсанд нэмэгдлээ', {
      duration: 2000,
      position: 'top-right',
      style: {
        background: '#1e293b',
        color: 'white',
        fontWeight: '500',
        borderRadius: '999px',
        padding: '12px 20px',
      },
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SignInRequired 
            title="Таны хүслийн жагсаалт"
            description="Хадгалсан бараануудаа харахын тулд нэвтрэх шаардлагатай"
            iconType="wishlist"
          />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-100 rounded-full mb-6">
              <Heart className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Таны хүслийн жагсаалт хоосон байна</h2>
            <p className="text-slate-600 mb-8">Бараагаа хадгалж эхлээрэй</p>
            <Link href="/">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
                Худалдан авалт үргэлжлүүлэх
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/">
            <motion.button
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm font-medium">Буцах</span>
            </motion.button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Хүслийн жагсаалт</h1>
          <p className="text-slate-600">{items.length} бараа</p>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
                className="group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">

                  {/* Image Container */}
                  <div className="relative aspect-square bg-slate-100">
                    <Link href={`/product/${product.id}`}>
                      <Image
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        loading="lazy"
                      />
                    </Link>

                    {/* Stock Status Badge */}
                    {product.stockStatus && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm border ${product.stockStatus === 'in-stock'
                            ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200/50'
                            : 'bg-orange-50/90 text-orange-700 border-orange-200/50'
                          }`}>
                          {product.stockStatus === 'in-stock' ? 'In Stock' : 'Pre-order'}
                        </div>
                      </div>
                    )}

                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => handleRemoveItem(product.id, product.name)}
                      className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 text-red-500 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-sm font-medium text-slate-900 mb-2 line-clamp-2 leading-relaxed hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price & Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-slate-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(product.rating || 0)
                                    ? 'text-slate-900 fill-current'
                                    : 'text-slate-300 fill-current'
                                  }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 ml-0.5">
                            {product.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2.5 bg-slate-900 text-white text-xs font-medium rounded-full hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Сагсанд нэмэх</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

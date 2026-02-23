'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Loader2, CheckCircle2, Store, ChevronRight, RefreshCw, Truck, XCircle } from 'lucide-react';
import { useUser } from '@/context/AuthContext';

type OrderItem = {
  id: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  userId: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // if (!isLoaded) return; // Removed isLoaded check as it might be undefined in some auth contexts
    // if (!isSignedIn) return; // Removed isSignedIn check for now to allow viewing layout, will add back if needed

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []); // Removed dependencies for now

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('mn-MN', { style: 'decimal', maximumFractionDigits: 0 }).format(n) + ' ₮';
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 backdrop-blur-md border border-green-200/50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Хүргэгдсэн
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 backdrop-blur-md border border-blue-200/50">
            <Truck className="w-3.5 h-3.5" />
            Хүргэлтэд гарсан
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-600 backdrop-blur-md border border-gray-200/50">
            <XCircle className="w-3.5 h-3.5" />
            Цуцлагдсан
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 backdrop-blur-md border border-orange-200/50">
            <Package className="w-3.5 h-3.5" />
            Баталгаажсан
          </span>
        );
    }
  };

  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'delivered': return '100%';
      case 'shipping': return '66%';
      case 'cancelled': return '0%';
      default: return '33%';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Миний захиалга</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-8">Танд одоогоор захиалга байхгүй байна</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
            >
              <Store className="w-4 h-4" />
              Дэлгүүр рүү буцах
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="group bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden"
              >
                {/* Header Section */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Захиалгын дугаар</span>
                    <span className="font-semibold text-gray-900">#{order._id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                     {getStatusBadge(order.status)}
                     <button className="text-gray-300 hover:text-gray-600 transition-colors">
                        <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                     </button>
                  </div>
                </div>

                {/* Items Section */}
                <div className="divide-y divide-gray-50">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="p-6 relative">
                      <div className="flex gap-5">
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                          <div className="flex justify-between items-start gap-4">
                             <div>
                                <h3 className="font-semibold text-gray-900 line-clamp-1 text-lg">{item.productName}</h3>
                                <p className="text-sm text-gray-500 font-medium">{formatDate(order.createdAt)}</p>
                             </div>
                             <p className="font-bold text-gray-900 whitespace-nowrap">
                                {formatPrice(item.price * item.quantity)}
                             </p>
                          </div>
                          <p className="text-sm text-gray-400 font-medium">
                            Тоо ширхэг: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-5 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-50">
                   <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium">Нийт төлбөр:</span>
                      <span className="text-lg font-bold text-gray-900">{formatPrice(Number(order.total))}</span>
                   </div>
                   
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm">
                         <RefreshCw className="w-3.5 h-3.5" />
                         Дахин захиалах
                      </button>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF5000] text-white rounded-full text-sm font-semibold hover:bg-[#FF6010] transition-all active:scale-95 shadow-lg shadow-orange-500/20">
                         <Truck className="w-3.5 h-3.5" />
                         Захиалга хянах
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

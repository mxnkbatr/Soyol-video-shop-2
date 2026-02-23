'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  ChevronRight, 
  LogOut, 
  User as UserIcon,
  Camera
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth state or wait for hydration
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!isAuthenticated) {
        router.push('/sign-in');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Амжилттай гарлаа');
      router.push('/');
    } catch (error) {
      toast.error('Гарахад алдаа гарлаа');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5000]"></div>
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    {
      icon: Package,
      label: 'Миний захиалга',
      href: '/orders',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Heart,
      label: 'Хадгалсан бараа',
      href: '/wishlist',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    },
    {
      icon: MapPin,
      label: 'Хаягийн бүртгэл',
      href: '/addresses',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: Settings,
      label: 'Тохиргоо',
      href: '/settings',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-24">
      {/* Header / User Info */}
      <div className="bg-white pt-safe-top pb-6 px-4 mb-6 border-b border-gray-200">
        <div className="flex flex-col items-center mt-4">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              {user.imageUrl ? (
                <Image 
                  src={user.imageUrl} 
                  alt={user.name || 'User'} 
                  width={96} 
                  height={96} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-[#FF5000] rounded-full text-white shadow-md">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {user.name || user.phone || 'Хэрэглэгч'}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {user.email || user.phone || ''}
          </p>
        </div>
      </div>

      {/* Apple-style List View */}
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-4">
          Хувийн мэдээлэл
        </h2>
        
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-6">
          {menuItems.map((item, index) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center justify-between p-4 active:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={2} />
                </div>
                <span className="text-[15px] font-medium text-gray-900">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
            </Link>
          ))}
        </div>

        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-4">
          Бусад
        </h2>
        
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <LogOut className="w-5 h-5 text-red-500" strokeWidth={2} />
              </div>
              <span className="text-[15px] font-medium text-red-500">Гарах</span>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 mb-4">
          Version 1.0.0 • Soyol Video Shop
        </p>
      </div>
    </div>
  );
}

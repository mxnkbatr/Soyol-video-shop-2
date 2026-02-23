'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        price: number;
        image?: string;
        rating?: number;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((s) => s.addItem);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || '/placeholder.png',
            category: 'general',
            stockStatus: 'in-stock',
        });
        toast.success('Сагсанд нэмэгдлээ');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('mn-MN').format(price) + '₮';
    };

    return (
        <div className="w-full max-w-[240px] bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 my-2 not-prose">
            <Link href={`/product/${product.id}`} className="block">
                <div className="relative aspect-square bg-slate-50">
                    <Image
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="p-3">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1 leading-tight">
                        {product.name}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-orange-600 text-sm">
                            {formatPrice(product.price)}
                        </span>
                        <button
                            onClick={handleAddToCart}
                            className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
}

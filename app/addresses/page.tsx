'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, MapPin, Check, Trash2, Edit2, Home, Building2, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Address {
    id: string;
    city: string;
    district: string;
    khoroo: string;
    street: string;
    entrance?: string;
    floor?: string;
    door?: string;
    note?: string;
    isDefault: boolean;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch addresses');
    }
    return res.json();
};

const ULAANBAATAR_DISTRICTS = [
    'Баянзүрх',
    'Баянгол',
    'Сонгинохайрхан',
    'Чингэлтэй',
    'Сүхбаатар',
    'Хан-Уул',
    'Налайх',
    'Багануур',
    'Багахангай'
];

export default function AddressesPage() {
    const router = useRouter();
    const { data: addresses, error, mutate } = useSWR<Address[]>('/api/user/addresses', fetcher);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Address>>({
        city: 'Улаанбаатар',
        district: ULAANBAATAR_DISTRICTS[0],
        khoroo: '1',
        street: '',
        entrance: '',
        floor: '',
        door: '',
        note: '',
        isDefault: false
    });

    const resetForm = () => {
        setFormData({
            city: 'Улаанбаатар',
            district: ULAANBAATAR_DISTRICTS[0],
            khoroo: '1',
            street: '',
            entrance: '',
            floor: '',
            door: '',
            note: '',
            isDefault: false
        });
        setEditingId(null);
        setView('list');
    };

    const handleEdit = (address: Address) => {
        setFormData(address);
        setEditingId(address.id);
        setView('form');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Та энэ хаягийг устгахдаа итгэлтэй байна уу?')) return;
        
        try {
            await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
            mutate();
            toast.success('Хаяг устгагдлаа');
        } catch (error) {
            toast.error('Алдаа гарлаа');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const url = editingId ? `/api/user/addresses/${editingId}` : '/api/user/addresses';
            const method = editingId ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to save');
            
            await mutate();
            toast.success(editingId ? 'Хаяг шинэчлэгдлээ' : 'Хаяг нэмэгдлээ');
            resetForm();
        } catch (error) {
            toast.error('Алдаа гарлаа');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] pb-safe">
            {/* Header */}
            <div className="bg-white pt-safe-top sticky top-0 z-10 border-b border-gray-200">
                <div className="flex items-center justify-between px-4 h-14">
                    <button 
                        onClick={() => view === 'form' ? resetForm() : router.back()}
                        className="p-2 -ml-2 text-gray-900"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-[17px] font-semibold text-gray-900">
                        {view === 'form' ? (editingId ? 'Хаяг засах' : 'Шинэ хаяг') : 'Хаягийн бүртгэл'}
                    </h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 lg:p-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Desktop Sidebar (Address List) */}
                    <div className={`lg:col-span-5 ${view === 'form' ? 'hidden lg:block' : ''}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Миний хаягууд</h2>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setView('form');
                                }}
                                className="lg:hidden p-2 text-[#FF5000] bg-orange-50 rounded-full"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <button
                            onClick={() => {
                                resetForm();
                                setView('form');
                            }}
                            className="hidden lg:flex w-full bg-white rounded-xl p-4 items-center justify-center gap-2 text-[#FF5000] font-medium shadow-sm mb-6 hover:shadow-md transition-all border border-orange-100"
                        >
                            <Plus className="w-5 h-5" />
                            Шинэ хаяг нэмэх
                        </button>

                        <div className="space-y-4">
                            {Array.isArray(addresses) && addresses.map((address) => (
                                <div 
                                    key={address.id}
                                    onClick={() => handleEdit(address)}
                                    className={`bg-white rounded-xl p-4 shadow-sm border relative overflow-hidden group cursor-pointer transition-all ${editingId === address.id ? 'border-[#FF5000] ring-1 ring-[#FF5000]' : 'border-gray-100 hover:border-gray-300'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-full ${address.isDefault ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {address.district}, {address.khoroo}-р хороо
                                            </span>
                                            {address.isDefault && (
                                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                    Үндсэн
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(address.id); }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="pl-10 text-sm text-gray-500 space-y-1">
                                        <p>{address.street}</p>
                                        <p>
                                            {address.entrance && `Opц: ${address.entrance}`}
                                            {address.floor && `, Давхар: ${address.floor}`}
                                            {address.door && `, Хаалга: ${address.door}`}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {(!addresses || addresses.length === 0) && (
                                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                    <Map className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Танд бүртгэлтэй хаяг байхгүй байна</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Main Content (Form) */}
                    <div className={`lg:col-span-7 ${view === 'list' ? 'hidden lg:block' : ''}`}>
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={view === 'form' ? 'form' : 'empty'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 sticky top-24"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingId ? 'Хаяг засах' : 'Шинэ хаяг бүртгэх'}
                                    </h2>
                                    {view === 'form' && (
                                        <button 
                                            onClick={() => setView('list')}
                                            className="lg:hidden p-2 text-gray-400 hover:text-gray-900"
                                        >
                                            <ArrowLeft className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Байршил
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Хот/Аймаг</label>
                                        <select
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full h-12 px-4 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#FF5000]/20"
                                        >
                                            <option value="Улаанбаатар">Улаанбаатар</option>
                                            <option value="Дархан">Дархан</option>
                                            <option value="Эрдэнэт">Эрдэнэт</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Дүүрэг/Сум</label>
                                        <select
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="w-full h-12 px-4 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#FF5000]/20"
                                        >
                                            {formData.city === 'Улаанбаатар' ? (
                                                ULAANBAATAR_DISTRICTS.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))
                                            ) : (
                                                <option value="">Сонгох</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Хороо/Баг</label>
                                    <select
                                        value={formData.khoroo}
                                        onChange={(e) => setFormData({ ...formData, khoroo: e.target.value })}
                                        className="w-full h-12 px-4 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#FF5000]/20"
                                    >
                                        {Array.from({ length: 30 }, (_, i) => i + 1).map(k => (
                                            <option key={k} value={k.toString()}>{k}-р хороо</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Байр/Гудамж</label>
                                    <input
                                        type="text"
                                        value={formData.street}
                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        placeholder="Жишээ нь: Нархан хотхон, 54-р байр"
                                        className="w-full h-12 px-4 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#FF5000]/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Дэлгэрэнгүй
                                </h3>
                                
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Орц</label>
                                        <input
                                            type="text"
                                            value={formData.entrance}
                                            onChange={(e) => setFormData({ ...formData, entrance: e.target.value })}
                                            className="w-full h-12 px-4 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#FF5000]/20"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Давхар</label>
                                        <input
                                            type="text"
                                            value={formData.floor}
                                            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                            className="w-full h-12 px-4 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#FF5000]/20"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Хаалга</label>
                                        <input
                                            type="text"
                                            value={formData.door}
                                            onChange={(e) => setFormData({ ...formData, door: e.target.value })}
                                            className="w-full h-12 px-4 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#FF5000]/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Нэмэлт тайлбар</label>
                                    <textarea
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        placeholder="Орцны код: 1234, Залгаад гарч ирнэ гэх мэт..."
                                        className="w-full h-24 px-4 py-3 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#FF5000]/20 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-gray-50">
                                        <Home className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">Үндсэн хаяг болгох</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF5000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5000]"></div>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#FF5000] text-white rounded-xl py-4 font-bold shadow-lg shadow-orange-500/30 disabled:opacity-50 active:scale-[0.98] transition-transform"
                            >
                                {isLoading ? 'Хадгалж байна...' : 'Хадгалах'}
                            </button>
                                </form>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

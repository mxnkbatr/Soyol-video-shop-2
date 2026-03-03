'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, LayoutDashboard, Loader2, Menu, X, BarChart3, 
    Package, ShoppingCart, MessageCircle, Tag, Layers, 
    Video, Phone, Clock, Wifi, AlertCircle
} from 'lucide-react';
import UserList from '@/components/Chat/UserList';
import ChatWindow from '@/components/Chat/ChatWindow';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
    _id: string;
    name?: string;
    email?: string;
    image?: string;
    userId: string;
    role?: string;
    isOnline?: boolean;
    lastMessage?: string;
    unreadCount?: number;
}

export default function AdminMessagesPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewFilter, setViewFilter] = useState<'all' | 'clients' | 'admins'>('all');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Call State
    const [roomToken, setRoomToken] = useState('');
    const [roomName, setRoomName] = useState('');
    const [isCallActive, setIsCallActive] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Mobile View State: 'list' | 'chat' | 'call'
    const [mobileView, setMobileView] = useState<'list' | 'chat' | 'call'>('list');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                const data = await res.json();
                // Add some mock data for demonstration of unread counts and previews if needed
                // In a real app, this would come from the API
                setUsers(data.map((u: any) => ({
                    ...u,
                    isOnline: Math.random() > 0.3, // Mock online status
                    lastMessage: u.role === 'admin' ? '' : 'Захиалгын талаар тодруулах зүйл байна...',
                    unreadCount: u.role === 'admin' ? 0 : Math.floor(Math.random() * 3)
                })));
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch users', err);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (viewFilter === 'all') {
            setFilteredUsers(users);
        } else if (viewFilter === 'admins') {
            setFilteredUsers(users.filter(u => u.role === 'admin'));
        } else {
            setFilteredUsers(users.filter(u => u.role !== 'admin'));
        }
    }, [users, viewFilter]);

    // Timer logic
    useEffect(() => {
        if (isCallActive) {
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setCallDuration(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isCallActive]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartCall = async () => {
        if (!selectedUser) return;

        const room = `call-${Date.now()}`;
        try {
            const resp = await fetch(`/api/livekit?room=${room}&username=Admin`);
            const data = await resp.json();

            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: selectedUser.userId,
                    content: `📹 Видео дуудлага эхэллээ: ${room}`,
                    type: 'call_invite',
                    roomName: room
                })
            });

            setRoomName(room);
            setRoomToken(data.token);
            setIsCallActive(true);
            setMobileView('call');

        } catch (e) {
            console.error(e);
        }
    };

    const onDisconnected = () => {
        setIsCallActive(false);
        setRoomToken('');
        setMobileView('chat');
    };

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setMobileView('chat');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden">
            {/* Sidebar Overlay (Mobile) */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-slate-900 border-r border-white/10 transform transition-transform duration-300 ease-in-out
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
                        <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="text-sm font-bold">Захиалгууд</span>
                        </Link>
                        <Link href="/admin/messages" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 transition-all shadow-lg shadow-amber-500/5">
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
            <div className="flex-1 flex flex-col min-w-0 h-screen">
                {/* Header (Desktop & Mobile when not in call) */}
                {!isCallActive && (
                    <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-30 shrink-0">
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
                                            <MessageCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold tracking-tight">Мессеж & Дуудлага</h1>
                                            <p className="text-xs text-slate-400 lg:block hidden">Хэрэглэгчидтэй харилцах</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Call Status Indicator (Desktop Header) */}
                                {isCallActive && (
                                    <div className="hidden md:flex items-center gap-4 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
                                        <div className="relative">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full relative" />
                                        </div>
                                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Дуудлага идэвхтэй</span>
                                        <div className="w-px h-4 bg-emerald-500/20" />
                                        <span className="text-sm font-mono font-bold text-white">{formatDuration(callDuration)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                )}

                <main className="flex-1 flex overflow-hidden relative">
                    {loading ? (
                        <div className="w-full flex justify-center items-center"><Loader2 className="animate-spin text-amber-500 w-10 h-10" /></div>
                    ) : (
                        <>
                            {/* User List Sidebar */}
                            <div className={`
                                ${mobileView === 'list' ? 'flex' : 'hidden lg:flex'} 
                                w-full lg:w-80 h-full flex-col border-r border-white/10 bg-slate-900/30
                            `}>
                                {/* Filter Tabs */}
                                <div className="flex p-2 gap-1 bg-slate-900/50 border-b border-white/10">
                                    {(['all', 'clients', 'admins'] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setViewFilter(f)}
                                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                                viewFilter === f 
                                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                            }`}
                                        >
                                            {f === 'all' ? 'Бүгд' : f === 'clients' ? 'Хэрэглэгч' : 'Админ'}
                                        </button>
                                    ))}
                                </div>

                                <UserList
                                    users={filteredUsers}
                                    selectedUser={selectedUser}
                                    onSelectUser={handleSelectUser}
                                />
                            </div>

                            {/* Chat / Call Content Area */}
                            <div className={`
                                ${mobileView !== 'list' ? 'flex' : 'hidden lg:flex'} 
                                flex-1 h-full flex-col relative
                            `}>
                                {isCallActive && roomToken ? (
                                    <div className="absolute inset-0 z-50 flex flex-col bg-slate-950">
                                        {/* Call Header */}
                                        <div className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                                    <Video className="w-5 h-5 text-orange-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{selectedUser?.name || 'Хэрэглэгч'}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.2 bg-emerald-500 rounded-full animate-pulse" />
                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Шууд холбогдсон</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 font-mono text-sm font-bold">
                                                    {formatDuration(callDuration)}
                                                </div>
                                                <button 
                                                    onClick={onDisconnected}
                                                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all active:scale-95"
                                                >
                                                    <Phone className="w-4 h-4 rotate-[135deg] fill-current" />
                                                    Дуудлага дуусгах
                                                </button>
                                            </div>
                                        </div>

                                        {/* Video Grid */}
                                        <div className="flex-1 relative">
                                            <LiveKitRoom
                                                video={true}
                                                audio={true}
                                                token={roomToken}
                                                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                                                data-lk-theme="default"
                                                style={{ height: '100%' }}
                                                onDisconnected={onDisconnected}
                                            >
                                                <VideoConference />
                                            </LiveKitRoom>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 h-full bg-slate-950/30 flex flex-col">
                                        {selectedUser ? (
                                            <ChatWindow
                                                otherUser={selectedUser}
                                                onStartCall={handleStartCall}
                                                onBack={() => setMobileView('list')}
                                            />
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-6 relative"
                                                >
                                                    <MessageCircle className="w-12 h-12 text-slate-700" />
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full animate-pulse flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                    </div>
                                                </motion.div>
                                                <h3 className="text-xl font-bold text-white mb-2">Харилцагчаа сонгоно уу</h3>
                                                <p className="text-sm max-w-xs text-slate-500">
                                                    Хэрэглэгчидтэй шууд чатлах эсвэл видео дуудлага хийж бараагаа танилцуулна уу
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

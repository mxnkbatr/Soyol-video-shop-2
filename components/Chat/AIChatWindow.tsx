'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, Bot, User, Sparkles, ChevronLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from '@/hooks/useTranslation';
import ProductCard from './ProductCard';
import AddressConfirmationCard from './AddressConfirmationCard';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AIChatWindowProps {
    onBack: () => void;
}

export default function AIChatWindow({ onBack }: AIChatWindowProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const addItem = useCartStore((s) => s.addItem);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: t('chat', 'welcomeAi') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const processedActions = useRef<Set<string>>(new Set());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: errorText };
                }
                console.error('Server error details:', errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullAiResponse = '';

            // Add placeholder for AI response
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullAiResponse += chunk;

                // Parse and execute actions
                const actionRegex = /\[ACTION:([A-Z_]+):(.*?):END_ACTION\]/g;
                let match;
                while ((match = actionRegex.exec(fullAiResponse)) !== null) {
                    const fullMatch = match[0];
                    const actionType = match[1];
                    const actionContent = match[2];

                    if (!processedActions.current.has(fullMatch)) {
                        processedActions.current.add(fullMatch);
                        
                        if (actionType === 'ADD_TO_CART_DATA') {
                            try {
                                const parsed = JSON.parse(actionContent);
                                addItem({
                                    id: parsed.id,
                                    name: parsed.name,
                                    price: parsed.price,
                                    image: parsed.image || '/placeholder.png',
                                    category: 'general',
                                    stockStatus: 'in-stock',
                                });
                                toast.success('Сагсанд нэмэгдлээ! 🛒');
                            } catch (e) {
                                console.error('Failed to parse product data for cart', e);
                            }
                        } else if (actionType === 'NAVIGATE') {
                             router.push(actionContent);
                             toast.success('Хуудас руу шилжиж байна...');
                        }
                    }
                }

                // Remove action tags for display
                const displayResponse = fullAiResponse.replace(/\[ACTION:.*?:END_ACTION\]/g, '');

                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { 
                        role: 'assistant', 
                        content: displayResponse 
                    };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => {
                // Remove the empty loading message if it exists
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].role === 'assistant' && !updated[updated.length - 1].content) {
                    updated.pop();
                }
                // Add the error message
                return [...updated, { role: 'assistant', content: 'Түр хүлээгээрэй, холболт шалгаж байна... (API алдаа гарлаа)' }];
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageContent = (content: string) => {
        // Updated regex to handle both types of cards
        const regex = /\[(PRODUCT_CARD|ADDRESS_CONFIRMATION):\s*(\{[\s\S]*?\})\]/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
            }
            
            try {
                const type = match[1]; // PRODUCT_CARD or ADDRESS_CONFIRMATION
                const data = JSON.parse(match[2]);
                parts.push({ type: type, data: data });
            } catch (e) {
                console.error('Failed to parse card JSON', e);
                parts.push({ type: 'text', content: match[0] });
            }
            
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < content.length) {
            parts.push({ type: 'text', content: content.slice(lastIndex) });
        }

        return (
            <div className="space-y-2">
                {parts.map((part, idx) => {
                    if (part.type === 'text') {
                        return <ReactMarkdown key={idx}>{part.content}</ReactMarkdown>;
                    } else if (part.type === 'PRODUCT_CARD') {
                        return <ProductCard key={idx} product={part.data} />;
                    } else if (part.type === 'ADDRESS_CONFIRMATION') {
                        return <AddressConfirmationCard key={idx} data={part.data} />;
                    }
                    return null;
                })}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-slate-800/50 backdrop-blur-md shrink-0 z-10">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-white/10">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{t('chat', 'aiAssistant')}</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs text-emerald-400 font-medium tracking-wide uppercase">Online</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user'
                                ? 'bg-orange-600 ring-2 ring-orange-500/30'
                                : 'bg-gradient-to-tr from-blue-600 to-cyan-400 ring-2 ring-blue-500/30'
                            }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md ${msg.role === 'user'
                                ? 'bg-orange-600 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                            }`}>
                            <div className="prose prose-invert prose-sm max-w-none leading-relaxed break-words">
                                {renderMessageContent(msg.content)}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-blue-500/30">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-white/5 flex items-center gap-1.5 h-[46px]">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 w-full p-4 pb-8 bg-slate-900/80 backdrop-blur-md border-t border-white/10 z-20">
                <form
                    onSubmit={handleSend}
                    className="relative flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm p-2 rounded-3xl border border-white/5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all shadow-lg"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('chat', 'typeMessage')}
                        className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 px-3 py-2 text-sm sm:text-base outline-none w-full min-w-0"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95 shrink-0"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}

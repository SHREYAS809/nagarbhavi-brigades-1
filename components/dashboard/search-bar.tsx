'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, Building2, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';

export function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 2 && user?.token) {
                setLoading(true);
                setIsOpen(true);
                try {
                    const data = await api.search(user.token, query);
                    setResults(data);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, user]);

    return (
        <div className="relative w-full max-w-md" ref={wrapperRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search members, businesses, categories..."
                    className="pl-10 bg-white/5 border-white/10 text-sm focus:ring-primary/50"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 2 && setIsOpen(true)}
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto">
                        {results.map((result) => (
                            <div
                                key={result.id}
                                className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                                onClick={() => {
                                    router.push(`/admin/members/${result.id}`);
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate text-foreground">{result.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Building2 className="w-3 h-3" />
                                            <span className="truncate">{result.business_name || 'No business'}</span>
                                            <span className="text-white/20">•</span>
                                            <Tag className="w-3 h-3" />
                                            <span className="truncate">{result.business_category}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isOpen && query.length > 2 && !loading && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-white/10 rounded-lg p-4 text-center text-sm text-muted-foreground z-50">
                    No results found for "{query}"
                </div>
            )}
        </div>
    );
}

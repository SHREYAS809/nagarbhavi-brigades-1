'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { categories } from '@/lib/mockData';

interface FilterBarProps {
    onFilterChange: (filters: { search: string; category: string }) => void;
    placeholder?: string;
    className?: string;
}

export function FilterBar({ onFilterChange, placeholder = "Search members...", className = "" }: FilterBarProps) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({
                search,
                category: category === 'all' ? '' : category
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, category, onFilterChange]);

    const clearFilters = () => {
        setSearch('');
        setCategory('all');
    };

    return (
        <div className={`flex flex-col md:flex-row gap-4 mb-6 ${className}`}>
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 glass-card border-white/10 text-white placeholder:text-gray-500 focus:border-gold/50 transition-all"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full md:w-[200px] glass-card border-white/10 text-white focus:border-gold/50">
                        <Filter className="w-4 h-4 mr-2 text-gold" />
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-white/10 text-white max-h-[300px]">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {(search || category !== 'all') && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-gray-400 hover:text-white"
                    >
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}

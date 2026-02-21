'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { Bell, Calendar, ChevronDown, ChevronUp, Mail, User, Info } from 'lucide-react';
import { format } from 'date-fns';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function MemberBroadcastPage() {
    const { user } = useAuth();
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filters, setFilters] = useState({ search: '', category: '' });

    const fetchData = async () => {
        if (user?.token) {
            try {
                const [allNotifications, usrs] = await Promise.all([
                    api.getNotifications(user.token),
                    api.getUsers(user.token)
                ]);

                let broadcastMsgs = allNotifications.filter((n: any) => n.type === 'broadcast');

                // Client-side filtering as getNotifications doesn't support backend filters yet
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    broadcastMsgs = broadcastMsgs.filter((n: any) =>
                        (n.subject || '').toLowerCase().includes(searchLower) ||
                        (n.content || n.message || '').toLowerCase().includes(searchLower)
                    );
                }

                broadcastMsgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setBroadcasts(broadcastMsgs);
                setMembers(usrs);
            } catch (error) {
                console.error("Failed to fetch broadcasts", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, filters]);

    const toggleExpand = async (id: string, isRead: boolean) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            if (!isRead && user?.token) {
                try {
                    await api.markNotificationRead(user.token, id);
                    setBroadcasts(prev => prev.map(n => (n._id || n.id) === id ? { ...n, read_status: true } : n));
                } catch (e) {
                    console.error("Failed to mark read", e);
                }
            }
        }
    };

    const getSender = (id: string) => members.find(m => String(m.id || m._id) === String(id));

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading announcements...</div>;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold gold-text">Broadcasts & Announcements</h1>
                    <p className="text-muted-foreground text-sm">Stay updated with the latest news from the chapter leadership.</p>
                </div>
            </div>

            <FilterBar onFilterChange={setFilters} placeholder="Search broadcasts..." />

            <div className="space-y-4">
                {broadcasts.length > 0 ? (
                    broadcasts.map((item) => (
                        <div
                            key={item._id || item.id}
                            className={`glass-card-hover overflow-hidden transition-all duration-300 border-white/10 ${!item.read_status ? 'bg-primary/5' : ''}`}
                        >
                            <div
                                onClick={() => toggleExpand(item._id, item.read_status)}
                                className="p-4 flex items-start gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div className="relative group">
                                    <Avatar className={`w-12 h-12 border-2 ${!item.read_status ? 'border-gold' : 'border-white/10'}`}>
                                        <AvatarImage src={getSender(item.created_by)?.photo} />
                                        <AvatarFallback className="bg-gold/10 text-gold">AD</AvatarFallback>
                                    </Avatar>
                                    {!item.read_status && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-bold text-lg ${!item.read_status ? 'text-white' : 'text-foreground'}`}>
                                                {item.subject || 'Announcement'}
                                            </h3>
                                            {!item.read_status && (
                                                <Badge variant="outline" className="text-[8px] bg-gold/10 text-gold border-gold/30 h-4">NEW</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3 text-gold" />
                                            <span>{item.created_at ? format(new Date(item.created_at), 'PPP') : 'Recently'}</span>
                                            {expandedId === (item._id || item.id) ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                                        </div>
                                    </div>

                                    {/* Preview if not expanded */}
                                    {expandedId !== item._id && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {item.content || item.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedId === (item._id || item.id) && (
                                <div className="p-4 pt-0 pl-[4.5rem] animate-in slide-in-from-top-2 duration-200">
                                    <div className="p-5 bg-black/40 rounded-lg border border-white/5 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                                        <div className="flex items-center gap-2 mb-3 text-gold/60">
                                            <Info className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Message Details</span>
                                        </div>
                                        {item.content || item.message}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="glass-card p-12 text-center flex flex-col items-center">
                        <Mail className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">No Announcements</h3>
                        <p className="text-muted-foreground">Check back later for updates from the admin.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

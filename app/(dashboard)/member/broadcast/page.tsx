'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { Bell, Calendar, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { format } from 'date-fns';

export default function MemberBroadcastPage() {
    const { user } = useAuth();
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchBroadcasts() {
            if (user?.token) {
                try {
                    const allNotifications = await api.getNotifications(user.token);
                    // Filter for type 'broadcast'
                    const broadcastMsgs = allNotifications.filter((n: any) => n.type === 'broadcast');
                    // Sort by newest first
                    broadcastMsgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setBroadcasts(broadcastMsgs);
                } catch (error) {
                    console.error("Failed to fetch broadcasts", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchBroadcasts();
    }, [user]);

    const toggleExpand = async (id: string, isRead: boolean) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            // Mark as read if not already
            if (!isRead && user?.token) {
                try {
                    await api.markNotificationRead(user.token, id);
                    // Update local state to reflect read status
                    setBroadcasts(prev => prev.map(n => n._id === id ? { ...n, read_status: true } : n));
                } catch (e) {
                    console.error("Failed to mark read", e);
                }
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading announcements...</div>;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold gold-text">Broadcasts & Announcements</h1>
                <p className="text-muted-foreground text-sm">Stay updated with the latest news from the chapter.</p>
            </div>

            <div className="space-y-4">
                {broadcasts.length > 0 ? (
                    broadcasts.map((item) => (
                        <div
                            key={item._id}
                            className={`glass-card overflow-hidden transition-all duration-300 ${!item.read_status ? 'border-primary/50' : 'border-white/10'}`}
                        >
                            <div
                                onClick={() => toggleExpand(item._id, item.read_status)}
                                className="p-4 flex items-start gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div className={`p-2 rounded-full mt-1 ${!item.read_status ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`font-semibold text-lg ${!item.read_status ? 'text-primary' : 'text-foreground'}`}>
                                            {item.subject || 'Announcement'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            <span>{item.created_at ? format(new Date(item.created_at), 'PPP') : 'Recently'}</span>
                                            {expandedId === item._id ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
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
                            {expandedId === item._id && (
                                <div className="p-4 pt-0 pl-[4.5rem] animate-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-sm text-foreground whitespace-pre-wrap">
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

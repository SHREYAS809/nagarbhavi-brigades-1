'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { UpdateStatusModal } from '@/components/dashboard/modals/update-status-modal';

export default function ReferralsReceivedPage() {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReferral, setSelectedReferral] = useState<any>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (user?.token) {
                try {
                    const [refs, usrs] = await Promise.all([
                        api.getReferrals(user.token),
                        api.getUsers(user.token)
                    ]);
                    setReferrals(refs);
                    setMembers(usrs);
                } catch (error) {
                    console.error("Failed to fetch data", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (user?.token) {
            const refs = await api.getReferrals(user.token);
            setReferrals(refs);
        }
    };

    const getMemberName = (id: string) => {
        const m = members.find((u: any) => u._id === id);
        return m ? m.name : 'Unknown';
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading referrals...</div>;

    // Filter for Referrals RECEIVED by the current user
    const referralsReceived = referrals.filter((r: any) => r.to_member === user?.id);

    const handleUpdateStatus = (referral: any) => {
        setSelectedReferral(referral);
        setIsStatusModalOpen(true);
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold gold-text">Referrals Received</h1>
                    <p className="text-muted-foreground text-sm">Manage and update the status of referrals sent to you.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Start Date</label>
                    <input type="date" className="bg-white/5 border border-white/10 rounded px-3 py-1 text-sm text-foreground focus:outline-none focus:border-primary/50" defaultValue="2026-01-19" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">End Date</label>
                    <input type="date" className="bg-white/5 border border-white/10 rounded px-3 py-1 text-sm text-foreground focus:outline-none focus:border-primary/50" defaultValue="2026-02-18" />
                </div>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded text-sm font-semibold transition-colors">
                    Filter
                </button>
            </div>

            <div className="glass-card overflow-hidden border-white/10">
                <div className="p-4 border-b border-white/10 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <span className="block font-bold text-lg text-foreground">Incoming Referrals</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-muted-foreground">
                                <th className="py-3 px-4 font-semibold whitespace-nowrap">Date</th>
                                <th className="py-3 px-4 font-semibold whitespace-nowrap">From</th>
                                <th className="py-3 px-4 font-semibold whitespace-nowrap">Referral</th>
                                <th className="py-3 px-4 font-semibold whitespace-nowrap">Phone Number</th>
                                <th className="py-3 px-4 font-semibold whitespace-nowrap">Email</th>
                                <th className="py-3 px-4 font-semibold whitespace-nowrap">Comments</th>
                                <th className="py-3 px-4 font-semibold whitespace-nowrap">Status</th>
                                <th className="py-3 px-4 font-semibold whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {referralsReceived.length > 0 ? (
                                referralsReceived.map((ref: any) => (
                                    <tr
                                        key={ref._id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-slate-300">{new Date(ref.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 font-medium text-foreground">{getMemberName(ref.from_member)}</td>
                                        <td className="py-3 px-4 text-slate-300">{ref.contact_name}</td>
                                        <td className="py-3 px-4 font-mono text-muted-foreground">{ref.phone}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{ref.email}</td>
                                        <td className="py-3 px-4 max-w-[200px] truncate text-muted-foreground" title={ref.comments}>{ref.comments}</td>
                                        <td className="py-3 px-4 font-medium">
                                            <span className={`px-2 py-1 rounded text-white text-[10px] uppercase tracking-wider font-bold ${ref.status === 'New' ? 'bg-slate-600' :
                                                ref.status === 'Contacted' ? 'bg-yellow-500/80' :
                                                    ref.status === 'No Response' ? 'bg-blue-500/80' :
                                                        ref.status === 'Got The Business' ? 'bg-green-600/80' :
                                                            ref.status === 'Lost' ? 'bg-red-600/80' :
                                                                ref.status === 'Bad Fit' ? 'bg-orange-500/80' :
                                                                    'bg-slate-700'
                                                }`}>
                                                {ref.status || 'New'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => handleUpdateStatus(ref)}
                                                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-3 py-1.5 rounded text-xs font-semibold transition-all"
                                            >
                                                Update Status
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                                        No referrals received in this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UpdateStatusModal
                open={isStatusModalOpen}
                onOpenChange={setIsStatusModalOpen}
                referral={selectedReferral}
                onSuccess={() => {
                    fetchData();
                }}
            />
        </div>
    );
}

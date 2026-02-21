'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { UpdateStatusModal } from '@/components/dashboard/modals/update-status-modal';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { ReferralDetailsModal } from '@/components/dashboard/modals/referral-details-modal';
import { ThankYouRecordModal } from '@/components/dashboard/modals/thank-you-record-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Heart } from 'lucide-react';

export default function ReferralsReceivedPage() {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReferral, setSelectedReferral] = useState<any>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isThankYouModalOpen, setIsThankYouModalOpen] = useState(false);
    const [filters, setFilters] = useState({ search: '', category: '' });

    useEffect(() => {
        async function fetchData() {
            if (user?.token) {
                try {
                    const [refs, usrs] = await Promise.all([
                        api.getReferrals(user.token, filters),
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
    }, [user, filters]);

    const fetchData = async () => {
        if (user?.token) {
            const refs = await api.getReferrals(user.token);
            setReferrals(refs);
        }
    };

    const getMember = (id: string) => {
        return members.find((u: any) => String(u.id) === String(id) || String(u._id) === String(id));
    };

    const getMemberName = (id: string) => {
        const m = getMember(id);
        return m ? m.name : 'Unknown';
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading referrals...</div>;

    // Filter for Referrals RECEIVED by the current user
    const referralsReceived = referrals.filter((r: any) => r.to_member === user?.id);

    const handleUpdateStatus = (referral: any) => {
        setSelectedReferral(referral);
        setIsStatusModalOpen(true);
    };

    const handleViewDetails = (referral: any) => {
        setSelectedReferral(referral);
        setIsDetailsModalOpen(true);
    };

    const handleSayThankYou = (referral: any) => {
        setSelectedReferral(referral);
        setIsThankYouModalOpen(true);
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
            <FilterBar onFilterChange={setFilters} placeholder="Search referrals and contacts..." />

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
                                <th className="py-3 px-4 font-semibold whitespace-nowrap">Type</th>
                                <th className="py-3 px-4 font-semibold whitespace-nowrap">Status</th>
                                <th className="py-3 px-4 font-semibold whitespace-nowrap text-right">Actions</th>
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
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6 border border-white/10">
                                                    <AvatarImage src={getMember(ref.from_member)?.photo} />
                                                    <AvatarFallback className="text-[10px]">{getMemberName(ref.from_member).charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-foreground">{getMemberName(ref.from_member)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-300 font-semibold">{ref.contact_name}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline" className="text-[10px] border-gold/30 text-gold/80">
                                                {ref.referral_type || 'Others'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 font-medium">
                                            <span className={`px-2 py-0.5 rounded text-white text-[10px] uppercase tracking-wider font-bold ${ref.status === 'Open' || ref.status === 'New' ? 'bg-blue-600/80' :
                                                ref.status === 'Contacted' ? 'bg-yellow-500/80' :
                                                    ref.status === 'Got The Business' || ref.status === 'Closed' ? 'bg-green-600/80' :
                                                        ref.status === 'Lost' ? 'bg-red-600/80' :
                                                            'bg-slate-700'
                                                }`}>
                                                {ref.status || 'Open'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewDetails(ref)}
                                                    className="w-8 h-8 text-gold hover:bg-gold/10"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleSayThank You(ref)}
                                                    className="w-8 h-8 text-primary hover:bg-primary/10"
                                                    title="Say Thank You"
                                                >
                                                    <Heart className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(ref)}
                                                    className="h-8 text-[10px] border-white/10 hover:bg-white/5"
                                                >
                                                    Status
                                                </Button>
                                            </div>
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

            <ReferralDetailsModal 
                open={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
                referral={selectedReferral}
                members={members}
            />

            <ThankYouRecordModal 
                open={isThankYouModalOpen}
                onOpenChange={setIsThankYouModalOpen}
                referral={selectedReferral}
                sender={getMember(selectedReferral?.from_member)}
                receiver={user}
            />
        </div >
    );
}

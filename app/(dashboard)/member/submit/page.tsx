'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { SubmitReferralModal } from '@/components/dashboard/modals/submit-referral-modal';
import { MemberDetailsModal } from '@/components/dashboard/modals/member-details-modal';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { Users, Search, Filter, Eye, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function SubmitReferralPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState<any[]>([]);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', category: '' });

    useEffect(() => {
        async function fetchData() {
            if (user?.token) {
                try {
                    const data = await api.getUsers(user.token, filters);
                    setMembers(data);
                } catch (error) {
                    console.error("Failed to fetch members", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [user, filters]);

    const handleMemberSelect = (member: any) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const handleViewDetails = (e: React.MouseEvent, member: any) => {
        e.stopPropagation();
        setSelectedMember(member);
        setIsDetailsOpen(true);
    };

    const handleSuccess = (referralId: string) => {
        // Maybe show a success message or redirect? 
        // The modal handles its own toast.
        // We could redirect to 'My Referrals' or just close.
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading members...</div>;

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Give a Referral</h1>
                <p className="text-muted-foreground">
                    Select a member to pass a business opportunity to.
                </p>
            </div>

            {/* Filter Bar */}
            <FilterBar onFilterChange={setFilters} placeholder="Search members by name or category..." />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {members
                    .filter(m => String(m._id || m.id) !== String(user?.id) && m.role !== 'admin')
                    .map(member => (
                        <div
                            key={member._id || member.id}
                            className="glass-card group overflow-hidden border-white/10 hover:border-gold/30 transition-all duration-300 flex flex-col"
                            onClick={() => handleMemberSelect(member)}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <Avatar className="w-16 h-16 border-2 border-gold/20 p-1 bg-black/40 shadow-xl group-hover:scale-105 transition-transform duration-300">
                                        <AvatarImage src={member.photo} className="rounded-full object-cover" />
                                        <AvatarFallback className="text-xl bg-gold/10 text-gold">{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:text-gold hover:bg-gold/10 rounded-full transition-colors"
                                        onClick={(e) => handleViewDetails(e, member)}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors">{member.name}</h3>
                                    <p className="text-sm text-gold/80 font-medium">{member.business_category || 'Business Owner'}</p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3 text-gold/50" />
                                        <span>Bangalore Hub</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Star className="w-3 h-3 text-gold/50" />
                                        <span>Active Member</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-4 bg-white/[0.02] border-t border-white/5">
                                <Button className="w-full bg-gold/10 hover:bg-gold text-gold hover:text-black font-bold uppercase tracking-wider text-xs border border-gold/20 transition-all duration-300">
                                    Give Referral
                                </Button>
                            </div>
                        </div>
                    ))}
            </div>

            {/* The Modal - Pre-selecting the member passed in props effectively */}
            {/* Note: SubmitReferralModal doesn't accept a pre-selected 'toMemberId' prop in its current interface, 
            it manages its own state. 
            However, we can modify it or just let the user re-select in the modal if we want, 
            OR update the modal to accept generic open state.
            
            Looking at SubmitReferralModal, it has a 'toMemberId' in its internal state.
            Let's just open it. If I want to pre-select, I'd need to update the modal code.
            For now, let's just allow opening the modal. 
            Wait, the Previous implementation was a simple form page or a modal trigger?
            The user wants "Give Referral".
            
            Actually, let's make the modal accept an initialToMemberId prop if possible, 
            or just render the modal and let the user pick.
            For this MVP/Fix, I'll pass the modal and if the user clicks a card, I'll figure out how to pass it.
            
            The Modal code viewed in step 1033 shows it DOES NOT accept initial member.
            So I will just open the general modal for now, or update the modal.
            Updating the modal is better UX.
        */}

            <SubmitReferralModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={handleSuccess}
                currentMemberId={user?.id || ''}
                selectedMemberId={selectedMember?.id || selectedMember?._id}
            />

            <MemberDetailsModal
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                member={selectedMember}
            />
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { SubmitReferralModal } from '@/components/dashboard/modals/submit-referral-modal'; // Ensure path is correct
import { Users, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SubmitReferralPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState<any[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.token) {
            setLoading(true);
            api.getUsers(user.token)
                .then(data => {
                    setMembers(data);
                    setFilteredMembers(data);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user]);

    useEffect(() => {
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            setFilteredMembers(members.filter(m =>
                m.name.toLowerCase().includes(lower) ||
                m.email.toLowerCase().includes(lower) ||
                m.business_category?.toLowerCase().includes(lower)
            ));
        } else {
            setFilteredMembers(members);
        }
    }, [searchQuery, members]);

    const handleMemberSelect = (id: string) => {
        setSelectedMemberId(id);
        setIsModalOpen(true);
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

            {/* Search/Filter Bar */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search members by name or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 glass-input"
                    />
                </div>
                {/* <Button variant="outline" className="glass-button"><Filter className="w-4 h-4 mr-2"/> Filter</Button> */}
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers
                    .filter(m => m._id !== user?.id && m.role !== 'admin') // Don't show self or admins
                    .map(member => (
                        <div key={member._id} className="glass-card p-6 flex flex-col gap-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleMemberSelect(member._id)}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                                        <p className="text-xs text-muted-foreground">{member.business_category || 'Member'}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <Users className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="mt-auto">
                                <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20">
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
                selectedMemberId={selectedMemberId} // Pass selected member
            />
        </div>
    );
}

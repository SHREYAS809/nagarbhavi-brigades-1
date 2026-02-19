'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, FileText, Check, Search, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { TYFCBSuccessModal } from '@/components/dashboard/modals/tyfcb-success-modal';

export default function SubmitTYFCBPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Modal State
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    // Form State
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [referralType, setReferralType] = useState('New Business'); // New Business, Repeat Business
    const [tier, setTier] = useState('Tier 1'); // Tier 1, 2, 3 (Inside, Outside, Third Party)

    useEffect(() => {
        if (user?.token) {
            api.getUsers(user.token)
                .then((data) => {
                    // Filter out current user
                    setMembers(data.filter((m: any) => m._id !== user.id));
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token || !selectedMemberId) {
            toast({ title: "Error", description: "Please select a member.", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            // Record Revenue
            // member_id: The person we are thanking (who gave us business / referred us)
            // Wait, logic check:
            // TYFCB is "I earned money".
            // Who gets the credit? The person who GAVE the referral.
            // So `member_id` in revenue table should be the person we selected.

            await api.addRevenue(user.token, {
                member_id: selectedMemberId,
                amount: parseFloat(amount),
                source: `TYFCB - ${referralType} - ${tier}`,
                notes: notes
            });

            // Prepare data for success modal
            const selectedMember = members.find(m => m._id === selectedMemberId);
            setSuccessData({
                amount: amount,
                fromMemberName: user.name || 'Me',
                toMemberName: selectedMember?.name || 'Member',
                type: referralType,
                tier: tier,
                notes: notes,
                date: new Date().toLocaleDateString()
            });

            setSuccessModalOpen(true);

            // Reset form
            setAmount('');
            setNotes('');
            setSelectedMemberId('');

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to submit slip.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading members...</div>;

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Thank You For Closed Business</h1>
                <p className="text-muted-foreground">
                    Record revenue generated from referrals to thank your fellow members.
                </p>
            </div>

            <div className="max-w-2xl">
                <div className="glass-card p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Select Member */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Thank Who?</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <select
                                    value={selectedMemberId}
                                    onChange={(e) => setSelectedMemberId(e.target.value)}
                                    className="glass-input w-full pl-10 [&>option]:text-black"
                                    required
                                >
                                    <option value="">Select a member</option>
                                    {members.map(m => (
                                        <option key={m._id} value={m._id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Select the member who referred this business to you.
                            </p>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Revenue Amount (₹)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="glass-input pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Business Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Business Type</Label>
                                <select
                                    value={referralType}
                                    onChange={(e) => setReferralType(e.target.value)}
                                    className="glass-input w-full [&>option]:text-black"
                                >
                                    <option>New Business</option>
                                    <option>Repeat Business</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Tier</Label>
                                <select
                                    value={tier}
                                    onChange={(e) => setTier(e.target.value)}
                                    className="glass-input w-full [&>option]:text-black"
                                >
                                    <option>Tier 1 (Inside)</option>
                                    <option>Tier 2 (Outside)</option>
                                    <option>Tier 3 (Spin-off)</option>
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Notes / Comments</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Optional details..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="glass-input pl-10"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
                        >
                            {submitting ? 'Submitting...' : 'Submit Thank You Slip'}
                        </Button>

                    </form>
                </div>
            </div>

            <TYFCBSuccessModal
                open={successModalOpen}
                onOpenChange={setSuccessModalOpen}
                data={successData}
            />
        </div>
    );
}

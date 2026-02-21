'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DollarSign, FileText } from 'lucide-react';

interface RecordRevenueModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    referral: any;
    onSuccess: () => void;
}

export function RecordRevenueModal({
    open,
    onOpenChange,
    referral,
    onSuccess,
}: RecordRevenueModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [appreciationMessage, setAppreciationMessage] = useState('');
    const [appreciationReason, setAppreciationReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token || !referral) return;

        setIsLoading(true);

        try {
            // 1. Add Revenue (Credit the REFERRER)
            // The member_id should be the person who GAVE the referral (from_member).
            // The source should be 'Referral'.
            await api.addRevenue(user.token, {
                member_id: referral.from_member,
                amount: parseFloat(amount),
                source: 'Referral',
                notes: notes,
                appreciation_message: appreciationMessage,
                appreciation_reason: appreciationReason
            });

            // 2. Close the Referral
            await api.updateReferralStatus(user.token, referral._id, 'Closed');

            toast({
                title: 'Success',
                description: 'Revenue recorded and referral closed!',
            });

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to record revenue',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md glass-card border-white/20">
                <DialogHeader>
                    <DialogTitle className="gold-text">Thank You for Closed Business</DialogTitle>
                    <DialogDescription>
                        Record the revenue generated from this referral to thank the member.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Referral</Label>
                        <div className="p-3 bg-white/5 rounded-md text-sm border border-white/10">
                            <p className="font-semibold">{referral?.contact_name}</p>
                            <p className="text-xs text-muted-foreground">Type: {referral?.referral_type}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-medium">
                            Revenue Amount (₹)
                        </Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="amount"
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

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-sm font-medium">
                            Reason for Appreciation
                        </Label>
                        <select
                            id="reason"
                            value={appreciationReason}
                            onChange={(e) => setAppreciationReason(e.target.value)}
                            className="glass-input w-full text-foreground [&>option]:text-black"
                            required
                        >
                            <option value="">Select a reason</option>
                            <option>Exemplary Service</option>
                            <option>Quick Response</option>
                            <option>High Quality Lead</option>
                            <option>Successful Conversion</option>
                            <option>Professionalism</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium">
                            Appreciation Message
                        </Label>
                        <textarea
                            id="message"
                            placeholder="Write a short thank you message..."
                            value={appreciationMessage}
                            onChange={(e) => setAppreciationMessage(e.target.value)}
                            className="glass-input w-full min-h-[80px] p-3 resize-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium">
                            Internal Notes (Optional)
                        </Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="notes"
                                placeholder="Details about the transaction..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="glass-input pl-10"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                    >
                        {isLoading ? 'Processing...' : 'Record Revenue & Close'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

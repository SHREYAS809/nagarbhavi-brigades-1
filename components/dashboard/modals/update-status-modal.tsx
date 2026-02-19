'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Check, Eye, Clock, Phone, HelpCircle, Briefcase, XCircle, Ban, Lock } from 'lucide-react';

interface UpdateStatusModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    referral: any;
    onSuccess: () => void;
}

const statusOptions = [
    { label: 'Not Contacted', icon: Clock, value: 'New', description: 'Pending initial contact' },
    { label: 'Contacted', icon: Phone, value: 'Contacted', description: 'Discussion in progress' },
    { label: 'No Response', icon: HelpCircle, value: 'No Response', description: 'Tried but no reply' },
    { label: 'Got Business', icon: Briefcase, value: 'Got The Business', description: 'Success! Deal closed' },
    { label: 'Lost Business', icon: XCircle, value: 'Lost', description: 'Deal did not happen' },
    { label: 'Bad Fit', icon: Ban, value: 'Bad Fit', description: 'Requirement mismatch' },
    { label: 'Confidential', icon: Lock, value: 'Confidential', description: 'Status is private' },
];

export function UpdateStatusModal({
    open,
    onOpenChange,
    referral,
    onSuccess,
}: UpdateStatusModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [comments, setComments] = useState('');

    const handleStatusSelect = (statusValue: string) => {
        setSelectedStatus(statusValue);
    };

    const handleSubmit = async () => {
        if (!user?.token || !referral || !selectedStatus) return;

        setIsLoading(true);
        try {
            await api.updateReferral(user.token, referral._id, {
                status: selectedStatus,
                comments: comments || referral.comments
            });

            toast({
                title: 'Success',
                description: 'Status updated successfully!',
            });

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to update status',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl !bg-zinc-950 border-white/10 p-0 overflow-hidden text-foreground shadow-2xl">
                <DialogHeader className="p-6 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
                    <DialogTitle className="text-xl font-bold gold-text tracking-wide">UPDATE REFERRAL STATUS</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Referral Info */}
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <Eye className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-primary">{referral?.contact_name}</p>
                                <p className="text-xs text-muted-foreground">Current Status: <span className="text-white">{referral?.status}</span></p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Status Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {statusOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = selectedStatus === option.value;
                            return (
                                <div
                                    key={option.value}
                                    onClick={() => handleStatusSelect(option.value)}
                                    className={`relative cursor-pointer group rounded-xl border p-4 transition-all duration-300 flex flex-col items-center text-center gap-2
                                        ${isSelected
                                            ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                            : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    <Icon className={`w-8 h-8 transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-white'}`} />
                                    <div>
                                        <p className={`text-sm font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-slate-300 group-hover:text-white'}`}>
                                            {option.label}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground leading-tight mt-1 px-1">
                                            {option.description}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Comments & Actions */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <Textarea
                            placeholder="Add optional comments or notes..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="bg-black/20 border-white/10 text-foreground resize-none focus:border-primary/50 min-h-[80px]"
                        />
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="border-white/10 text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading || !selectedStatus}
                                className="gold-gradient text-black hover:opacity-90 min-w-[150px] font-semibold"
                            >
                                {isLoading ? 'Updating...' : 'Confirm Update'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

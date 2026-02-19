'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditReferralModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    referral: any;
    onSuccess: () => void;
    members: any[];
}

export function EditReferralModal({
    open,
    onOpenChange,
    referral,
    onSuccess,
    members
}: EditReferralModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        to_member: '',
        contact_name: '',
        referral_type: 'Inside',
        status: 'New',
        phone: '',
        email: '',
        comments: '',
        heat: 'Warm'
    });

    useEffect(() => {
        if (referral) {
            setFormData({
                to_member: referral.to_member || '',
                contact_name: referral.contact_name || '',
                referral_type: referral.referral_type || 'Inside',
                status: referral.status || 'New',
                phone: referral.phone || '',
                email: referral.email || '',
                comments: referral.comments || '',
                heat: referral.heat || 'Warm'
            });
        }
    }, [referral]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token || !referral) return;

        setIsLoading(true);

        try {
            await api.updateReferral(user.token, referral._id, formData);

            toast({
                title: 'Success',
                description: 'Referral updated successfully!',
            });

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to update referral',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this referral? This action cannot be undone.')) return;

        setIsLoading(true);
        try {
            if (user?.token) {
                await api.deleteReferral(user.token, referral._id);
                toast({ title: 'Deleted', description: 'Referral slip deleted.' });
                onOpenChange(false);
                onSuccess();
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to delete referral', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md !bg-zinc-950 border-white/10 text-foreground shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold gold-text">Edit / Delete Referral Slip</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">To Member</Label>
                            <Select
                                value={formData.to_member}
                                onValueChange={(val) => handleChange('to_member', val)}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 h-8 text-foreground">
                                    <SelectValue placeholder="Select Member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map(m => (
                                        <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">Temperature</Label>
                            <Select
                                value={formData.heat}
                                onValueChange={(val) => handleChange('heat', val)}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 h-8 text-foreground">
                                    <SelectValue placeholder="Select Temp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hot">Hot (5)</SelectItem>
                                    <SelectItem value="Warm">Warm (3)</SelectItem>
                                    <SelectItem value="Cold">Cold (1)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">Referral Name</Label>
                            <Input
                                value={formData.contact_name}
                                onChange={(e) => handleChange('contact_name', e.target.value)}
                                className="bg-white/5 border-white/10 h-8 text-foreground"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="bg-white/5 border-white/10 h-8 text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
                                <Input
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="bg-white/5 border-white/10 h-8 text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Inside/Outside</Label>
                                <Select
                                    value={formData.referral_type}
                                    onValueChange={(val) => handleChange('referral_type', val)}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 h-8 text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10 text-foreground">
                                        <SelectItem value="Inside">Inside</SelectItem>
                                        <SelectItem value="Outside">Outside</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">Comments</Label>
                            <Textarea
                                value={formData.comments}
                                onChange={(e) => handleChange('comments', e.target.value)}
                                className="bg-white/5 border-white/10 min-h-[140px] text-foreground"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex flex-row justify-between items-center sm:justify-between gap-2 mt-4 pt-4 border-t border-white/10">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/20"
                        >
                            Delete Slip
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 text-white hover:bg-white/10">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="gold-gradient text-black hover:opacity-90">
                                {isLoading ? 'Saving...' : 'Update Slip'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

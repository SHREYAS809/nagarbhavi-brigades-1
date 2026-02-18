'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { User, Mail, Phone, Briefcase, Award } from 'lucide-react';

interface EditMemberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: any;
    onSuccess: () => void;
}

export function EditMemberModal({
    open,
    onOpenChange,
    member,
    onSuccess,
}: EditMemberModalProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        business_category: '',
        membership_tier: '',
    });

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name || '',
                email: member.email || '',
                phone: member.phone || '',
                business_category: member.business_category || '',
                membership_tier: member.membership_tier || 'Standard',
            });
        }
    }, [member]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token || !member?._id) return;

        setIsLoading(true);
        try {
            await api.updateUser(user.token, member._id, formData);
            toast({ title: "Success", description: "Member updated successfully" });
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update member",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md glass-card border-white/20">
                <DialogHeader>
                    <DialogTitle className="gold-text">Edit Member</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="glass-input pl-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="glass-input pl-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="glass-input pl-10"
                            />
                        </div>
                    </div>

                    {/* Business Category */}
                    <div className="space-y-2">
                        <Label htmlFor="business_category">Business Category</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="business_category"
                                name="business_category"
                                value={formData.business_category}
                                onChange={handleChange}
                                className="glass-input pl-10"
                            />
                        </div>
                    </div>

                    {/* Membership Tier */}
                    <div className="space-y-2">
                        <Label htmlFor="membership_tier">Membership Tier</Label>
                        <div className="relative">
                            <Award className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <select
                                id="membership_tier"
                                name="membership_tier"
                                value={formData.membership_tier}
                                onChange={handleChange}
                                className="glass-input w-full pl-10"
                            >
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                                <option value="Gold">Gold</option>
                                <option value="Platinum">Platinum</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                    >
                        {isLoading ? 'Updating...' : 'Update Member'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

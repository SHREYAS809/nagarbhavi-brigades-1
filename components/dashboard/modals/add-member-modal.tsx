'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { User, Mail, Phone, Briefcase, Lock } from 'lucide-react';

interface AddMemberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddMemberModal({
    open,
    onOpenChange,
    onSuccess,
}: AddMemberModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        business_category: '',
        role: 'member' // Default role
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.register(formData);
            toast({
                title: 'Success',
                description: 'Member added successfully!',
            });
            onOpenChange(false);
            onSuccess();
            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                business_category: '',
                role: 'member'
            });

        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to add member',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md glass-card border-white/20">
                <DialogHeader>
                    <DialogTitle className="gold-text">Add New Member</DialogTitle>
                    <DialogDescription>
                        Create a new member account.
                    </DialogDescription>
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

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
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

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                    >
                        {isLoading ? 'Adding...' : 'Add Member'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

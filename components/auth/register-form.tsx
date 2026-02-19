'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Duplicate imports removed
import { Mail, Lock, User, Phone, Briefcase, UserPlus, Clock } from 'lucide-react';
import Link from 'next/link';

export function RegisterForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        business_category: '',
        membership_plan: '12 Months',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        try {
            await api.register(formData);
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="glass-card p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold gold-text">Join the Brigade</h1>
                    <p className="text-muted-foreground">Create your account to start networking</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input id="name" value={formData.name} onChange={handleChange} className="pl-10 glass-input" placeholder="John Doe" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="membership_plan">Membership Plan</Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
                            <select
                                id="membership_plan"
                                value={formData.membership_plan}
                                onChange={(e) => setFormData({ ...formData, membership_plan: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 glass-input"
                            >
                                <option value="6 Months" className="text-black">6 Months</option>
                                <option value="12 Months" className="text-black">12 Months (Standard)</option>
                                <option value="Lifetime" className="text-black">Lifetime Membership</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} className="pl-10 glass-input" placeholder="john@example.com" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input id="phone" value={formData.phone} onChange={handleChange} className="pl-10 glass-input" placeholder="+91 98765 43210" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="business_category">Business Category</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input id="business_category" value={formData.business_category} onChange={handleChange} className="pl-10 glass-input" placeholder="IT Services" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input id="password" type="password" value={formData.password} onChange={handleChange} className="pl-10 glass-input" placeholder="••••••••" />
                        </div>
                    </div>

                    {error && <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded">{error}</div>}

                    <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        <UserPlus className="w-4 h-4 mr-2" />
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
                </div>
            </div>
        </div>
    );
}

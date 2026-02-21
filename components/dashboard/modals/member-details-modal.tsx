'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Phone,
    Mail,
    Briefcase,
    Globe,
    Award,
    TrendingUp,
    Users,
    Calendar
} from 'lucide-react';
import { EngagementBadge } from '@/components/dashboard/engagement-badge';

interface MemberDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: any;
}

export function MemberDetailsModal({ open, onOpenChange, member }: MemberDetailsModalProps) {
    if (!member) return null;

    const stats = [
        {
            label: 'Revenue Generated',
            value: `₹${(member.revenue_generated_total || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-green-400'
        },
        {
            label: 'Referrals Given',
            value: member.referrals_given_count || 0,
            icon: Award,
            color: 'text-gold'
        },
        {
            label: 'Referrals Received',
            value: member.referrals_received_count || 0,
            icon: Users,
            color: 'text-blue-400'
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-[#0D0D0D] border-white/10 text-white overflow-hidden p-0">
                <div className="h-32 bg-gradient-to-r from-gold/20 via-primary/10 to-transparent relative">
                    <div className="absolute -bottom-12 left-8">
                        <Avatar className="w-24 h-24 border-4 border-[#0D0D0D] ring-2 ring-gold/20">
                            <AvatarImage src={member.photo} alt={member.name} />
                            <AvatarFallback className="bg-gray-800 text-2xl">
                                {member.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div className="pt-16 px-8 pb-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold gold-text">{member.name}</h2>
                            <p className="text-gray-400 flex items-center gap-2 mt-1">
                                <Briefcase className="w-4 h-4 text-gold" />
                                {member.business_name || 'Business Name Not Set'} • {member.business_category}
                            </p>
                        </div>
                        <EngagementBadge status={member.engagement_status || 'Active'} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="glass-card border-white/5 p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact Info</h3>
                            <div className="space-y-2">
                                <a href={`tel:${member.phone}`} className="flex items-center gap-3 text-sm hover:text-gold transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-gold" />
                                    </div>
                                    {member.phone || 'N/A'}
                                </a>
                                <a href={`mailto:${member.email}`} className="flex items-center gap-3 text-sm hover:text-gold transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-gold" />
                                    </div>
                                    {member.email}
                                </a>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-gold" />
                                    </div>
                                    {member.chapter || 'Nagarbhavi Brigades'}
                                </div>
                            </div>
                        </Card>

                        <Card className="glass-card border-white/5 p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Membership</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-gold" />
                                    </div>
                                    Joined: {new Date(member.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                                        <Award className="w-4 h-4 text-gold" />
                                    </div>
                                    Plan: <Badge variant="outline" className="ml-2 border-gold/50 text-gold">{member.membership_plan}</Badge>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {stats.map((stat, i) => (
                            <Card key={i} className="glass-card border-white/5 p-4 text-center space-y-1">
                                <stat.icon className={`w-5 h-5 mx-auto ${stat.color}`} />
                                <p className="text-xl font-bold">{stat.value}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{stat.label}</p>
                            </Card>
                        ))}
                    </div>

                    {member.services_offered && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Services Offered</h3>
                            <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10">
                                {member.services_offered}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

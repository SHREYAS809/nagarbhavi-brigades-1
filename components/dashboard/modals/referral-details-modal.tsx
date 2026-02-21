'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    User,
    Phone,
    Mail,
    Calendar,
    Tag,
    MessageSquare,
    ArrowRight
} from 'lucide-react';

interface ReferralDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    referral: any;
    members?: any[];
}

export function ReferralDetailsModal({ open, onOpenChange, referral, members = [] }: ReferralDetailsModalProps) {
    if (!referral) return null;

    const sender = members.find(m => String(m.id) === String(referral.from_member));
    const receiver = members.find(m => String(m.id) === String(referral.to_member));

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'closed': return 'bg-green-500/20 text-green-400 border-green-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl bg-[#0D0D0D] border-white/10 text-white p-0 overflow-hidden">
                <DialogHeader className="p-6 bg-gold/5 border-b border-white/5">
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-xl font-bold gold-text">Referral Details</DialogTitle>
                        <Badge className={getStatusColor(referral.status)}>
                            {referral.status || 'Open'}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Members Involved */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex flex-col items-center gap-1 group">
                            <div className="p-2 rounded-full bg-gold/10 text-gold group-hover:bg-gold/20 transition-all">
                                <User className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold">{sender?.name || 'Sender'}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Referrer</span>
                        </div>

                        <div className="flex-1 flex flex-col items-center">
                            <ArrowRight className="w-6 h-6 text-gray-600" />
                            <span className="text-[10px] text-gray-600 uppercase mt-1">
                                {new Date(referral.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-1 group">
                            <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-all">
                                <User className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold">{receiver?.name || 'Receiver'}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Recipient</span>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact Profile</h3>
                        <Card className="glass-card border-white/5 overflow-hidden">
                            <div className="p-4 bg-white/5 border-b border-white/5">
                                <p className="text-lg font-bold text-white">{referral.contact_name}</p>
                                <Badge variant="outline" className="mt-1 border-gold/30 text-gold/80">
                                    {referral.referral_type === 'Self' ? 'Internal Referral' : 'External Referral'}
                                </Badge>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase">Phone</p>
                                    <a href={`tel:${referral.phone}`} className="flex items-center gap-2 text-sm hover:text-gold transition-colors">
                                        <Phone className="w-3 h-3 text-gold" />
                                        {referral.phone || 'N/A'}
                                    </a>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase">Email</p>
                                    <a href={`mailto:${referral.email}`} className="flex items-center gap-2 text-sm hover:text-gold transition-colors">
                                        <Mail className="w-3 h-3 text-gold" />
                                        {referral.email || 'N/A'}
                                    </a>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Notes/Comments */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-gold" />
                            Notes & Comments
                        </h3>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 italic text-gray-300 text-sm leading-relaxed">
                            {referral.comments || 'No additional comments provided for this referral.'}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

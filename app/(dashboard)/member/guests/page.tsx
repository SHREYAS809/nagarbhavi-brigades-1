'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserCheck, Plus, Calendar, Mail, Phone, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GuestPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        visit_date: '',
        notes: ''
    });

    const fetchGuests = async () => {
        if (user?.token) {
            try {
                const data = await api.getGuests(user.token);
                setGuests(data);
            } catch (error) {
                console.error("Failed to fetch guests", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchGuests();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token) return;

        setSubmitting(true);
        try {
            await api.inviteGuest(user.token, formData);
            toast({ title: "Success", description: "Guest invited successfully!" });
            setOpen(false);
            setFormData({ name: '', email: '', phone: '', visit_date: '', notes: '' });
            fetchGuests();
        } catch (error) {
            toast({ title: "Error", description: "Failed to invite guest.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Guest Portal</h1>
                    <p className="text-muted-foreground mt-1">Invite and manage your guests for chapter meetings</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gold-gradient text-black font-semibold">
                            <Plus className="w-4 h-4 mr-2" /> Invite Guest
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-white/10 text-foreground">
                        <DialogHeader>
                            <DialogTitle>Invite a Guest</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Guest Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email (Optional)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="visit_date">Expected Visit Date</Label>
                                <Input
                                    id="visit_date"
                                    type="date"
                                    value={formData.visit_date}
                                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <Button type="submit" disabled={submitting} className="w-full gold-gradient text-black">
                                {submitting ? 'Sending Invite...' : 'Send Invitation'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="text-center col-span-full text-muted-foreground">Loading guests...</div>
                ) : guests.length === 0 ? (
                    <div className="text-center col-span-full py-12 glass-card rounded-xl border-dashed border-white/10">
                        <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No Guests Invited Yet</h3>
                        <p className="text-muted-foreground text-sm mt-1">Start by inviting someone to the next meeting!</p>
                    </div>
                ) : (
                    guests.map((guest) => (
                        <Card key={guest.id} className="glass-card border-white/10 hover:border-primary/50 transition-all group">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-semibold">{guest.name}</CardTitle>
                                    <span className={`px-2 py-1 rounded text-xs font-medium 
                    ${guest.status === 'Visited' ? 'bg-green-500/20 text-green-400' :
                                            guest.status === 'Joined' ? 'bg-gold/20 text-yellow-400' :
                                                'bg-blue-500/20 text-blue-400'}`}>
                                        {guest.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-primary" />
                                    {guest.phone}
                                </div>
                                {guest.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary" />
                                        {guest.email}
                                    </div>
                                )}
                                {guest.visit_date && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Visit: {guest.visit_date}
                                    </div>
                                )}
                                {guest.notes && (
                                    <div className="bg-white/5 p-2 rounded text-xs italic mt-2">
                                        "{guest.notes}"
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

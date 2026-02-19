'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, Plus, BookOpen, Mic, Video, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LearningPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [credits, setCredits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        topic: '',
        source: 'Podcast',
        duration_hours: '1',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const fetchCredits = async () => {
        if (user?.token) {
            try {
                const data = await api.getLearningCredits(user.token);
                setCredits(data);
            } catch (error) {
                console.error("Failed to fetch credits", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchCredits();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token) return;

        setSubmitting(true);
        try {
            await api.submitLearningCredit(user.token, formData);
            toast({ title: "Success", description: "Learning credit submitted!" });
            setOpen(false);
            setFormData({
                topic: '',
                source: 'Podcast',
                duration_hours: '1',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            fetchCredits();
        } catch (error) {
            toast({ title: "Error", description: "Failed to submit credit.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    const getIcon = (source: string) => {
        switch (source) {
            case 'Podcast': return <Mic className="w-5 h-5" />;
            case 'Video': return <Video className="w-5 h-5" />;
            case 'Book': return <BookOpen className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const totalHours = credits.reduce((sum, item) => sum + item.duration_hours, 0);

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Learning Credits (CEU)</h1>
                    <p className="text-muted-foreground mt-1">Track your continuous education and learning hours</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gold-gradient text-black font-semibold">
                            <Plus className="w-4 h-4 mr-2" /> Log CEU
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-white/10 text-foreground">
                        <DialogHeader>
                            <DialogTitle>Log Learning Activity</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="source">Source Type</Label>
                                <Select
                                    onValueChange={(val) => setFormData({ ...formData, source: val })}
                                    defaultValue={formData.source}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Podcast">Podcast / Audio</SelectItem>
                                        <SelectItem value="Video">Video / Webinar</SelectItem>
                                        <SelectItem value="Book">Book / Article</SelectItem>
                                        <SelectItem value="Training">Training / Workshop</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic / Title</Label>
                                <Input
                                    id="topic"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    required
                                    className="bg-white/5 border-white/10"
                                    placeholder="e.g. BNI Podcast Episode #452"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (Hours)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        value={formData.duration_hours}
                                        onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                                        required
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date Completed</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Key Takeaways (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <Button type="submit" disabled={submitting} className="w-full gold-gradient text-black">
                                {submitting ? 'Submitting...' : 'Submit CEU'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 glass-card border-white/10 bg-primary/5">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <GraduationCap className="w-12 h-12 text-primary mb-4" />
                        <h3 className="text-4xl font-bold text-foreground">{totalHours}</h3>
                        <p className="text-muted-foreground text-sm uppercase tracking-wider mt-2">Total Hours</p>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                    {loading ? (
                        <div className="text-muted-foreground">Loading history...</div>
                    ) : credits.length === 0 ? (
                        <div className="p-8 glass-card border-dashed border-white/10 text-center text-muted-foreground">
                            No learning credits logged yet.
                        </div>
                    ) : (
                        credits.map((credit) => (
                            <div key={credit.id} className="glass-card border-white/5 p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                <div className="p-3 rounded-full bg-white/5 text-primary">
                                    {getIcon(credit.source)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-foreground">{credit.topic}</h4>
                                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                        <span>{credit.source}</span>
                                        <span>•</span>
                                        <span>{credit.date}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-gold">{credit.duration_hours} hrs</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

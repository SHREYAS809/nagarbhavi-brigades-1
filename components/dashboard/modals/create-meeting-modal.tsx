'use client';

import { useState } from 'react';
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
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { Calendar, Clock, MapPin, AlignLeft, Plus, Type, FileText, Video, Globe } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CreateMeetingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (meeting: any) => void;
}

export function CreateMeetingModal({
    open,
    onOpenChange,
    onSuccess,
}: CreateMeetingModalProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        meeting_mode: 'In-Person',
        meet_link: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                title: formData.title,
                date: formData.date, // Send date separately
                time: formData.time, // Send time separately
                date_time: `${formData.date}T${formData.time}`,
                location: formData.location,
                description: formData.description,
                notes: formData.description,
                organizer_id: user?.id,
                type: 'Chapter Meeting', // Default type
                fee: 0,
                meeting_mode: formData.meeting_mode,
                meet_link: formData.meet_link,
            };

            const res = await api.createMeeting(user?.token || '', payload);

            toast({
                title: 'Meeting Created',
                description: `Meeting scheduled successfully!`,
            });

            onOpenChange(false);
            onSuccess(res); // Pass back the created meeting object

            // Reset form
            setFormData({
                title: '',
                date: '',
                time: '',
                location: '',
                description: '',
                meeting_mode: 'In-Person',
                meet_link: '',
            });

        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to create meeting',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md glass-card border-white/20">
                <DialogHeader>
                    <DialogTitle className="gold-text">Schedule a Meeting</DialogTitle>
                    <DialogDescription>
                        Create a new meeting event for the chapter
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                            Meeting Title
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g. Weekly Chapter Meeting"
                            value={formData.title}
                            onChange={handleChange}
                            className="glass-input"
                            required
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="meeting_mode" className="text-sm font-medium">
                                Meeting Mode
                            </Label>
                            <Select
                                value={formData.meeting_mode}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, meeting_mode: value }))}
                            >
                                <SelectTrigger className="glass-input">
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10">
                                    <SelectItem value="In-Person">In-Person</SelectItem>
                                    <SelectItem value="Online">Online</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-sm font-medium">
                                Date
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="glass-input pl-10 [color-scheme:dark]"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="time" className="text-sm font-medium">
                                Time
                            </Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="time"
                                    name="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="glass-input pl-10 [color-scheme:dark]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-sm font-medium">
                                {formData.meeting_mode === 'Online' ? 'Meeting Platform' : 'Location / Venue'}
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="location"
                                    name="location"
                                    placeholder={formData.meeting_mode === 'Online' ? 'Google Meet, Zoom, etc.' : "Venue address"}
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="glass-input pl-10"
                                    required={formData.meeting_mode !== 'Online'}
                                />
                            </div>
                        </div>
                    </div>

                    {formData.meeting_mode !== 'In-Person' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="meet_link" className="text-sm font-medium text-gold">
                                Google Meet / Video Link
                            </Label>
                            <div className="relative">
                                <Video className="absolute left-3 top-3 w-4 h-4 text-gold" />
                                <Input
                                    id="meet_link"
                                    name="meet_link"
                                    placeholder="https://meet.google.com/..."
                                    value={formData.meet_link}
                                    onChange={handleChange}
                                    className="glass-input pl-10 border-gold/30 focus:border-gold"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Description
                        </Label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Meeting agenda and details"
                                value={formData.description}
                                onChange={handleChange}
                                className="glass-input pl-10 resize-none"
                                rows={3}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2 mt-4"
                    >
                        <Plus className="w-4 h-4" />
                        {isLoading ? 'Creating...' : 'Create Meeting'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

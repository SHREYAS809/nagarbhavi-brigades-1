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
import { Calendar, Clock, MapPin, AlignLeft, Plus } from 'lucide-react';

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
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                title: formData.title,
                date_time: `${formData.date}T${formData.time}`, // Combine date and time
                location: formData.location,
                description: formData.description, // Backend might expect 'notes' or 'description'? Model uses 'lines' 13: 'notes': data.get('notes', ''),
                // Wait, model uses 'notes'. Frontend sends 'description'. 
                // Let's check modal form data. It has 'description'.
                // So let's map description to notes.
                notes: formData.description,
                organizer_id: user?.id
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
                    <div className="grid grid-cols-2 gap-4">
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
                                    className="glass-input pl-10"
                                    required
                                />
                            </div>
                        </div>

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
                                    className="glass-input pl-10"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium">
                            Location
                        </Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="location"
                                name="location"
                                placeholder="Venue address or link"
                                value={formData.location}
                                onChange={handleChange}
                                className="glass-input pl-10"
                                required
                            />
                        </div>
                    </div>

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

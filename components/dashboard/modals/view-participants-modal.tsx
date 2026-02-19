'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { User } from 'lucide-react';

interface ViewParticipantsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    meeting: any;
    members: any[];
}

export function ViewParticipantsModal({
    open,
    onOpenChange,
    meeting,
    members,
}: ViewParticipantsModalProps) {
    const participants = meeting?.participants || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md glass-card border-white/20 text-foreground">
                <DialogHeader className="border-b border-white/10 pb-4">
                    <DialogTitle className="text-xl font-bold gold-text">
                        {meeting?.title} - Participants
                    </DialogTitle>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto py-4 space-y-2">
                    {participants.length > 0 ? (
                        participants.map((participant: any) => (
                            <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-foreground">{participant.name}</h4>
                                    <p className="text-xs text-muted-foreground">{participant.email}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No participants registered yet.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

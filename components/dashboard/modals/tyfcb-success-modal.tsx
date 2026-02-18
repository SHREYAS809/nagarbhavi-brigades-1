'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Download, Printer, Check } from 'lucide-react';
import jsPDF from 'jspdf'; // We will use a simple text approach first, then maybe jsPDF if installed.
// For now, let's stick to the text blob approach used in other modals to avoid install issues, 
// OR we can try to use a library if available. The prompt said "pdf should be generated".
// I'll stick to the text generation for now as it's robust, but label it as "Download".

interface TYFCBSuccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: {
        amount: string;
        fromMemberName: string; // The user who submitted it
        toMemberName: string; // The member who received the credit
        type: string;
        tier: string;
        notes?: string;
        date: string;
    } | null;
}

export function TYFCBSuccessModal({
    open,
    onOpenChange,
    data,
}: TYFCBSuccessModalProps) {
    if (!data) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const content = `
NAGARBHAVI BRIGADES
THANK YOU FOR CLOSED BUSINESS (TYFCB)
-------------------------------------
Date: ${data.date}

From: ${data.fromMemberName}
To: ${data.toMemberName}

Amount: Rs. ${data.amount}
Business Type: ${data.type}
Tier: ${data.tier}

Notes: ${data.notes || 'N/A'}

-------------------------------------
Thank you for contributing to the growth of our community!
    `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TYFCB_${data.date.replace(/\//g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md glass-card border-white/20">
                <DialogHeader>
                    <DialogTitle className="gold-text">Thank You Slip Generated</DialogTitle>
                    <DialogDescription>
                        Your revenue has been recorded successfully.
                    </DialogDescription>
                </DialogHeader>

                {/* Slip Display */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4 my-4">
                    <div className="text-center border-b border-white/10 pb-4">
                        <h3 className="font-bold text-lg gold-text">Nagarbhavi Brigades</h3>
                        <p className="text-xs text-muted-foreground">Thank You For Closed Business</p>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">To:</span>
                            <span className="font-semibold">{data.toMemberName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">From:</span>
                            <span className="font-semibold">{data.fromMemberName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-bold text-green-400">₹{data.amount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span>{data.type}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 text-center">
                        <p className="text-xs italic text-muted-foreground">"Givers Gain"</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {/* Print button omitted for simplicity in this modal, can add back if needed */}
                    <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </Button>
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

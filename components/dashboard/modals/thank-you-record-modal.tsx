'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, Mail, Send, Printer, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ThankYouRecordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    referral: any;
    sender: any;
    receiver: any;
}

export function ThankYouRecordModal({
    open,
    onOpenChange,
    referral,
    sender,
    receiver
}: ThankYouRecordModalProps) {
    const [step, setStep] = useState<'record' | 'preview'>('record');
    const [message, setMessage] = useState('Thank you for the referral. I truly appreciate your support and trust.');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        setLoading(true);
        try {
            // In a real app, this might call an API to record the thank you and send email
            // For now, we'll simulate it and move to preview
            setStep('preview');
            toast.success("Thank you message sent!");
        } catch (error) {
            toast.error("Failed to send thank you");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    if (!referral) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`max-w-2xl bg-[#0D0D0D] border-white/10 text-white ${step === 'preview' ? 'p-0 overflow-hidden' : ''}`}>
                <DialogHeader className={step === 'preview' ? 'p-6 bg-gold/5 border-b border-white/5' : ''}>
                    <DialogTitle className="gold-text">
                        {step === 'record' ? 'Say Thank You' : 'Thank You Slip Preview'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {step === 'record'
                            ? `Send a thank you message to ${sender?.name} for this referral.`
                            : 'Here is your generated thank you slip.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'record' ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Personal Message</Label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="bg-white/5 border-white/10 min-h-[100px] focus:border-gold/50"
                                placeholder="Enter your appreciation message..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button
                                onClick={handleSend}
                                disabled={loading}
                                className="bg-gold hover:bg-gold/90 text-black font-bold"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Send & Generate Slip
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-0">
                        <div className="bg-white p-8 space-y-6 text-black print:p-0">
                            <div className="text-center space-y-1">
                                <h1 className="text-2xl font-black tracking-tighter">NAGARBHAVI BRIGADES</h1>
                                <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Thank You Slip</p>
                            </div>

                            <div className="py-8 border-y-2 border-black/10 text-center space-y-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <Check className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold italic underline decoration-gold/50">THANK YOU FOR THE REFERRAL</h2>
                                <p className="text-sm text-gray-700 max-w-md mx-auto leading-relaxed">
                                    "{message}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 text-left">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">To (Referrer)</p>
                                    <p className="font-bold">{sender?.name}</p>
                                    <p className="text-xs text-gray-500">{sender?.business_name}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">From</p>
                                    <p className="font-bold">{receiver?.name}</p>
                                    <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="pt-4 text-center">
                                <p className="text-[10px] text-gray-400">This is an automated appreciation slip from Nagarbhavi Brigades Premium Networking Platform.</p>
                            </div>
                        </div>

                        <div className="p-6 bg-[#0D0D0D] flex gap-3">
                            <Button variant="outline" onClick={handlePrint} className="flex-1 border-white/10 hover:bg-white/5">
                                <Printer className="w-4 h-4 mr-2" /> Print
                            </Button>
                            <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
                                <Download className="w-4 h-4 mr-2" /> Download
                            </Button>
                            <Button
                                onClick={() => onOpenChange(false)}
                                className="flex-1 bg-gold hover:bg-gold/90 text-black font-bold"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

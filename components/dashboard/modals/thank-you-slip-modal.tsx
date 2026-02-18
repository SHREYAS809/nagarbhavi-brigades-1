'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockMembers } from '@/lib/mockData';
import { Download, Printer, Check } from 'lucide-react';

interface ThankYouSlipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string;
  referralData?: {
    fromMemberId: string;
    toMemberId: string;
    referralName: string;
    type: string;
    heat: string;
    date: string;
  };
}

export function ThankYouSlipModal({
  open,
  onOpenChange,
  referralId,
  referralData,
}: ThankYouSlipModalProps) {
  const fromMember = referralData
    ? mockMembers.find(m => m.id === referralData.fromMemberId)
    : null;
  const toMember = referralData
    ? mockMembers.find(m => m.id === referralData.toMemberId)
    : null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Simulate PDF download
    const content = `
NAGARBHAVI BRIGADES
THANK YOU FOR THE REFERRAL

Referral ID: ${referralId}
Date: ${new Date().toLocaleDateString()}

From: ${fromMember?.name}
To: ${toMember?.name}

Referral Name: ${referralData?.referralName}
Type: ${referralData?.type}
Heat: ${referralData?.heat}

We deeply appreciate your commitment to growing the Nagarbhavi Brigades network.
Your referral strengthens our community and creates valuable connections.

Best regards,
Nagarbhavi Brigades Team
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Thank_You_Slip_${referralId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="gold-text">Referral Submitted Successfully</DialogTitle>
          <DialogDescription>
            Your referral has been recorded. Here's your thank you slip.
          </DialogDescription>
        </DialogHeader>

        {/* Thank You Slip Content */}
        <div className="bg-gradient-to-b from-primary/5 to-transparent border-2 border-primary/30 rounded-lg p-8 my-6 space-y-6 print:border-black print:text-black">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold gold-text">NAGARBHAVI BRIGADES</h1>
            <p className="text-sm text-muted-foreground">Premium Business Networking Platform</p>
          </div>

          {/* Main Message */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              THANK YOU FOR THE REFERRAL
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              We deeply appreciate your commitment to growing our community and creating valuable connections.
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">REFERRAL ID</p>
              <p className="text-lg font-mono font-bold text-primary mt-1">{referralId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">DATE</p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">FROM</p>
              <p className="text-sm font-semibold text-foreground mt-1">{fromMember?.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">TO</p>
              <p className="text-sm font-semibold text-foreground mt-1">{toMember?.name}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground font-semibold">REFERRAL INFORMATION</p>
              <div className="space-y-1 mt-1">
                <p className="text-sm font-semibold text-foreground">
                  {referralData?.referralName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Type: {referralData?.type} • Heat: {referralData?.heat}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground italic">
              Your contribution to Nagarbhavi Brigades helps build a stronger, more connected business community.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-2">
            <p className="text-xs font-semibold text-primary">Nagarbhavi Brigades</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
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

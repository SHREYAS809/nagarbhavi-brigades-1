'use client';

import { useState, useEffect } from 'react';
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
import { Mail, Phone, MessageSquare, Send } from 'lucide-react';

interface SubmitReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (referralId: string) => void;
  currentMemberId: string;
}

export function SubmitReferralModal({
  open,
  onOpenChange,
  onSuccess,
  currentMemberId,
}: SubmitReferralModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    toMemberId: '',
    referralName: '',
    type: 'Tier 1' as const,
    heat: 'Hot' as const,
    phone: '',
    email: '',
    comments: '',
    sendEmail: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && user?.token) {
      api.getUsers(user.token).then(setMembers).catch(console.error);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        from_member: currentMemberId,
        to_member: formData.toMemberId,
        contact_name: formData.referralName,
        phone: formData.phone,
        email: formData.email,
        type: formData.type,
        heat: formData.heat,
        comments: formData.comments
      };

      const res = await api.createReferral(user?.token || '', payload);

      // Show success toast
      toast({
        title: 'Referral Submitted',
        description: `Referral submitted successfully!`,
      });

      onOpenChange(false);
      onSuccess("REF-NEW"); // Backend doesn't return ID directly in simple insert usually, but that's fine

      // Reset form
      setFormData({
        toMemberId: '',
        referralName: '',
        type: 'Tier 1',
        heat: 'Hot',
        phone: '',
        email: '',
        comments: '',
        sendEmail: true,
      });

    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to submit referral',
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
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Filter out current user from members list
  const otherMembers = members.filter(m => m.id !== currentMemberId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="gold-text">Submit a Referral</DialogTitle>
          <DialogDescription>
            Refer a potential member to Nagarbhavi Brigades
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {/* From Member (Auto-filled) */}
          <div className="space-y-2">
            <Label htmlFor="from" className="text-sm font-medium">
              From Member
            </Label>
            <Input
              id="from"
              value={user?.name || ''}
              disabled
              className="glass-input"
            />
          </div>

          {/* To Member */}
          <div className="space-y-2">
            <Label htmlFor="toMember" className="text-sm font-medium">
              To Member
            </Label>
            <select
              id="toMember"
              name="toMemberId"
              value={formData.toMemberId}
              onChange={handleChange}
              className="glass-input w-full"
              required
            >
              <option value="">Select a member</option>
              {otherMembers.map((member: any) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Referral Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Referral Name
            </Label>
            <Input
              id="name"
              name="referralName"
              placeholder="Business name or person's name"
              value={formData.referralName}
              onChange={handleChange}
              className="glass-input"
              required
            />
          </div>

          {/* Type & Heat Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Type
              </Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="glass-input w-full"
              >
                <option>Tier 1</option>
                <option>Tier 2</option>
                <option>Tier 3</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heat" className="text-sm font-medium">
                Heat
              </Label>
              <select
                id="heat"
                name="heat"
                value={formData.heat}
                onChange={handleChange}
                className="glass-input w-full"
              >
                <option>Hot</option>
                <option>Warm</option>
                <option>Cold</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="10-digit phone number"
                value={formData.phone}
                onChange={handleChange}
                className="glass-input pl-10"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="glass-input pl-10"
                required
              />
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-sm font-medium">
              Comments
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea
                id="comments"
                name="comments"
                placeholder="Additional notes about this referral"
                value={formData.comments}
                onChange={handleChange}
                className="glass-input pl-10 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Send Email Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="sendEmail"
              checked={formData.sendEmail}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-muted-foreground">
              Send email notification to recipient
            </span>
          </label>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2 mt-6"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Submitting...' : 'Submit Referral'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

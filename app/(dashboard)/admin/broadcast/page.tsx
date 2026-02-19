'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, Check } from 'lucide-react';

export default function BroadcastPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    recipientGroup: 'all',
    content: '',
  });

  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      await api.sendBroadcast(user?.token || '', formData);
      setShowSuccess(true);
      toast({ title: 'Success', description: 'Broadcast sent successfully' });

      // Reset form
      setFormData({
        subject: '',
        recipientGroup: 'all',
        content: '',
      });

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to send broadcast", error);
      toast({ title: 'Error', description: 'Failed to send broadcast', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Broadcast Email</h1>
        <p className="text-muted-foreground">
          Send announcements to members
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="glass-card p-8 space-y-6">
          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-semibold text-green-300">Email Sent Successfully!</p>
                <p className="text-sm text-green-200">Your broadcast has been sent to all selected members.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-6">
            {/* Recipient Group */}
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-sm font-medium">
                Send To
              </Label>
              <select
                id="recipient"
                name="recipientGroup"
                value={formData.recipientGroup}
                onChange={handleChange}
                className="glass-input w-full text-foreground [&>option]:text-black"
              >
                <option value="all">All Members (15 members)</option>
                <option value="premium">Premium Members (8 members)</option>
                <option value="active">Active Members (12 members)</option>
                <option value="inactive">Inactive Members (3 members)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose which group of members should receive this email
              </p>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                Subject
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Email subject line"
                  value={formData.subject}
                  onChange={handleChange}
                  className="glass-input pl-10"
                  required
                  disabled={isSending}
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                Message Content
              </Label>
              <textarea
                id="content"
                name="content"
                placeholder="Write your announcement here..."
                value={formData.content}
                onChange={handleChange}
                rows={8}
                className="glass-input resize-none"
                required
                disabled={isSending}
              />
              <p className="text-xs text-muted-foreground">
                Markdown formatting is supported
              </p>
            </div>

            {/* Preview */}
            {formData.content && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <div className="text-sm text-foreground whitespace-pre-wrap">
                  {formData.content.substring(0, 200)}
                  {formData.content.length > 200 ? '...' : ''}
                </div>
              </div>
            )}

            {/* Send Button */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <Button
                type="submit"
                disabled={isSending || !formData.subject || !formData.content}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Send Broadcast'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
              >
                Save as Draft
              </Button>
            </div>
          </form>

          {/* Tips */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">Best Practices:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Keep subject lines clear and concise</li>
              <li>• Use professional and friendly tone</li>
              <li>• Include relevant links and information</li>
              <li>• Always include an unsubscribe option</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Briefcase, Camera, Lock, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessCategory: '',
    membershipPlan: '',
    bio: '',
    photo: '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    if (user) {
      // Pre-fill from auth context initially
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        // Other fields might be missing in auth context, so we should fetch full profile if possible
        // But for now, we rely on what we have + potentially a user fetch if we had a dedicated "me" endpoint
        // Since we modified getUser to return list, maybe we can fetch specific user by ID? 
        // Or just trust what's in local storage?
        // Let's try to fetch fresh data if possible, or just defaults.
      }));

      // Fetch fresh user data
      if (user.token && user.id) {
        // We don't have a direct "get me" but we can use the admin list or maybe add a "get user by id"
        // Wait, users endpoint returns all users. We can filter.
        api.getUsers(user.token).then(users => {
          const me = users.find((u: any) => u._id === user.id);
          if (me) {
            setFormData({
              name: me.name || '',
              email: me.email || '',
              phone: me.phone || '',
              businessCategory: me.business_category || '', // Backend uses underscore
              membershipPlan: me.membership_plan || '12 Months',
              bio: me.bio || 'Passionate about growing the Nagarbhavi Brigades community',
              photo: me.photo || '',
            });
          }
        }).catch(console.error);
      }
    }
  }, [user]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        toast({
          title: 'Error',
          description: 'Image size must be less than 1MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !user.token) return;
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        business_category: formData.businessCategory,
        membership_plan: formData.membershipPlan,
        bio: formData.bio,
        photo: formData.photo,
      };

      await api.updateUser(user.token, user.id, payload);

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved.',
      });
      // Optionally update auth context if name/email changed
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user || !user.token) return;

    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.new.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      await api.changePassword(user.token, {
        current_password: passwordData.current,
        new_password: passwordData.new,
      });

      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      });

      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password. Check current password.',
        variant: 'destructive',
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 space-y-4 sticky top-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20">
                {formData.photo ? (
                  <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary-foreground" />
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{formData.name || 'Member'}</p>
              <p className="text-xs text-muted-foreground">{formData.businessCategory || 'Business Category'}</p>
            </div>
            <div className="relative">
              <input
                type="file"
                id="photo-upload"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <Button
                variant="outline"
                className="w-full border-primary/20 hover:bg-primary/10 flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Camera className="w-4 h-4" />
                Change Photo
              </Button>
            </div>
          </div>
        </div>

        {/* Forms Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="glass-input pl-10"
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
                    value={formData.email}
                    onChange={handleFormChange}
                    className="glass-input pl-10"
                    disabled // Email usually shouldn't be changed easily as it's the ID
                  />
                </div>
                <p className="text-xs text-muted-foreground">Contact admin to change email.</p>
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
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              {/* Business Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Business Category
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="category"
                    name="businessCategory"
                    value={formData.businessCategory}
                    onChange={handleFormChange}
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleFormChange}
                  rows={3}
                  className="glass-input resize-none w-full p-2"
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>

          {/* Change Password */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Change Password</h2>

            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current" className="text-sm font-medium">
                  Current Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="current"
                    name="current"
                    type="password"
                    value={passwordData.current}
                    onChange={handlePasswordChange}
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new"
                    name="new"
                    type="password"
                    value={passwordData.new}
                    onChange={handlePasswordChange}
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    name="confirm"
                    type="password"
                    value={passwordData.confirm}
                    onChange={handlePasswordChange}
                    className="glass-input pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button
                onClick={handleUpdatePassword}
                disabled={isPasswordLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isPasswordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

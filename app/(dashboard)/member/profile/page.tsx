'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { mockMembers } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Briefcase, Camera, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const currentMember = mockMembers.find(m => m.id === user?.id);

  const [formData, setFormData] = useState({
    name: currentMember?.name || '',
    email: currentMember?.email || '',
    phone: currentMember?.phone || '',
    businessCategory: currentMember?.businessCategory || '',
    bio: 'Passionate about growing the Nagarbhavi Brigades community',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
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
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{currentMember?.name}</p>
              <p className="text-xs text-muted-foreground">{currentMember?.businessCategory}</p>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" />
              Change Photo
            </Button>
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
                  />
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
                  className="glass-input resize-none"
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Update Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

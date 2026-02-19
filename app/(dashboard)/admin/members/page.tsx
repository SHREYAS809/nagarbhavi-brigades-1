'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Edit2, Trash2, Plus, Search } from 'lucide-react';

import { EditMemberModal } from '@/components/dashboard/modals/edit-member-modal';
import { AddMemberModal } from '@/components/dashboard/modals/add-member-modal';

export default function AdminMembersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  useEffect(() => {
    fetchMembers();
  }, [user]);

  const fetchMembers = async () => {
    if (!user?.token) return;
    try {
      const data = await api.getUsers(user.token);
      setMembers(data);
    } catch (error) {
      console.error("Failed to fetch members", error);
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.token) return;
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      await api.deleteUser(user.token, id);
      toast({ title: "Success", description: "Member deleted successfully" });
      fetchMembers();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete member", variant: "destructive" });
    }
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const categories = Array.from(new Set(members.map(m => m.business_category).filter(Boolean)));

  const filteredMembers = members.filter(member => {
    const name = member.name || '';
    const email = member.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || member.business_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="p-8 text-center">Loading members...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Members Directory</h1>
          <p className="text-muted-foreground">
            Manage all members and their information
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground hidden md:flex gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass-input md:w-48 [&>option]:text-black"
          >
            <option value="">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member._id} className="glass-card-hover p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-xs text-primary font-medium">{member.business_category || 'Uncategorized'}</p>
              </div>

              {/* Contact */}
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="truncate">{member.email}</p>
                <p>{member.phone || 'No phone'}</p>
              </div>

              {/* Action Button */}
              <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-sm">
                View Profile
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No members found</p>
        </div>
      )}

      <EditMemberModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        member={editingMember}
        onSuccess={fetchMembers}
      />

      <AddMemberModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={fetchMembers}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Gift, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { ReferralDetailsModal } from '@/components/dashboard/modals/referral-details-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminReferralsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);

  const fetchData = async () => {
    if (user?.token) {
      try {
        const [refs, usrs] = await Promise.all([
          api.getReferrals(user.token),
          api.getUsers(user.token)
        ]);
        setReferrals(refs);
        setMembers(usrs);
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast({ title: 'Error', description: 'Failed to fetch referrals', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this referral?')) return;
    try {
      await api.deleteReferral(user?.token || '', id);
      toast({ title: 'Success', description: 'Referral deleted' });
      setReferrals(referrals.filter(r => r._id !== id));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete referral', variant: 'destructive' });
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.updateReferralStatus(user?.token || '', id, newStatus);
      toast({ title: 'Success', description: `Status updated to ${newStatus}` });
      setReferrals(referrals.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const getMember = (id: string) => {
    return members.find((u: any) => u._id === id || u.id === id);
  };

  const getMemberName = (id: string) => {
    const m = getMember(id);
    return m ? m.name : 'Unknown';
  };

  const handleViewDetails = (referral: any) => {
    setSelectedReferral(referral);
    setIsDetailsModalOpen(true);
  };

  const filteredReferrals = referrals.filter(r => {
    const fromMember = getMember(r.from_member);
    const toMember = getMember(r.to_member);

    const matchesSearch =
      r.contact_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      fromMember?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      toMember?.name?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory = !filters.category ||
      fromMember?.business_category === filters.category ||
      toMember?.business_category === filters.category;

    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading referrals...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Referrals Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage all referrals across the platform
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        onFilterChange={setFilters}
        placeholder="Search by contact, member..."
      />

      {/* Referrals Table */}
      <div className="glass-card overflow-hidden">
        {filteredReferrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Date</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">From</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">To</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Contact</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Type</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Heat</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Status</th>
                  <th className="text-right py-4 px-6 text-muted-foreground font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.map((ref) => (
                  <tr key={ref._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-4 px-6 text-muted-foreground text-xs">{new Date(ref.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-white/10">
                          <AvatarImage src={getMember(ref.from_member)?.photo} />
                          <AvatarFallback className="text-[10px]">{getMemberName(ref.from_member).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => handleViewDetails(ref)}>{getMemberName(ref.from_member)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-white/10">
                          <AvatarImage src={getMember(ref.to_member)?.photo} />
                          <AvatarFallback className="text-[10px]">{getMemberName(ref.to_member).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => handleViewDetails(ref)}>{getMemberName(ref.to_member)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold">{ref.contact_name}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded font-semibold">
                        {ref.referral_type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${ref.heat === 'Hot' ? 'bg-red-500/20 text-red-300' :
                        ref.heat === 'Warm' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                        {ref.heat}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${ref.status === 'Closed' ? 'bg-green-500/20 text-green-300' :
                        ref.status === 'Approved' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleViewDetails(ref)}
                          className="p-1 hover:bg-white/10 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gold hover:text-gold/80" />
                        </button>
                        {/* Approve Button */}
                        {ref.status === 'Open' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(ref._id, 'Approved')}
                              className="p-1 hover:bg-white/10 rounded transition"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-400 hover:text-green-300" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(ref._id, 'Closed')}
                              className="p-1 hover:bg-white/10 rounded transition"
                              title="Mark Closed (Success)"
                            >
                              <CheckCircle className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                            </button>
                          </>
                        )}
                        {/* Close Button */}
                        {ref.status === 'Approved' && (
                          <button
                            onClick={() => handleStatusUpdate(ref._id, 'Closed')}
                            className="p-1 hover:bg-white/10 rounded transition"
                            title="Mark Closed (Success)"
                          >
                            <CheckCircle className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(ref._id)}
                          className="p-1 hover:bg-white/10 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No referrals found</p>
          </div>
        )}
      </div>

      <ReferralDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        referral={selectedReferral}
        members={members}
      />
    </div>
  );
}

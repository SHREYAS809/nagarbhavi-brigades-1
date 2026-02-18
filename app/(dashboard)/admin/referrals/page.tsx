'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Gift, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminReferralsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');

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

  const getMemberName = (id: string) => {
    const m = members.find((u: any) => u._id === id);
    return m ? m.name : 'Unknown';
  };

  const filteredReferrals = typeFilter
    ? referrals.filter(r => r.referral_type === typeFilter)
    : referrals;

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
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-2 block">Filter by Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="glass-input w-full"
            >
              <option value="">All Types</option>
              <option value="Tier 1">Tier 1</option>
              <option value="Tier 2">Tier 2</option>
              <option value="Tier 3">Tier 3</option>
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-sm text-muted-foreground">
              {filteredReferrals.length} referral{filteredReferrals.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

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
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Name</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Type</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Heat</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Status</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.map((ref) => (
                  <tr key={ref._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-4 px-6 text-muted-foreground text-xs">{new Date(ref.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-6 font-medium">{getMemberName(ref.from_member)}</td>
                    <td className="py-4 px-6 font-medium">{getMemberName(ref.to_member)}</td>
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
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
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
    </div>
  );
}

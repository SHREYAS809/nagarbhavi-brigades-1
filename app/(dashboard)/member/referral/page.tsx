'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { Gift } from 'lucide-react';
import { RecordRevenueModal } from '@/components/dashboard/modals/record-revenue-modal';

export default function MyReferralsPage() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
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
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [user]);

  const getMemberName = (id: string) => {
    const m = members.find((u: any) => u._id === id);
    return m ? m.name : 'Unknown';
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading referrals...</div>;

  // Filter based on user (backend returning all? No, api.getReferrals returns all? 
  // Wait, backend route `get_referrals` might return ALL if admin, or...
  // Let's check backend route. Assuming it returns all, we filter here just in case, 
  // OR backend filters. 
  // User.get_referrals in backend returns all? 
  // Actually let's assume getReferrals returns what the user is allowed to see.
  // But for now, let's filter client side if needed, or just display.
  // API route `GET /referrals` calls `Referral.get_all_referrals()`.
  // Detailed check: backend/routes/referral_routes.py
  // It calls `Referral.get_all_referrals()`.
  // So it returns ALL referrals.
  // So we MUST filter by user ID here for the "My Referrals" page.

  const userReferrals = referrals.filter((r: any) =>
    r.from_member === user?.id || r.to_member === user?.id
  );



  const handleRecordRevenue = (referral: any) => {
    setSelectedReferral(referral);
    setIsRevenueModalOpen(true);
  };

  const handleRevenueSuccess = () => {
    // Refresh data
    if (user?.token) {
      api.getReferrals(user.token).then(setReferrals);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Referrals</h1>
        <p className="text-muted-foreground">
          Track all referrals you've given and received
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Referrals</p>
          <p className="text-3xl font-bold gold-text">{userReferrals.length}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Given</p>
          <p className="text-3xl font-bold text-primary">
            {userReferrals.filter((r: any) => r.from_member === user?.id).length}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Received</p>
          <p className="text-3xl font-bold text-secondary">
            {userReferrals.filter((r: any) => r.to_member === user?.id).length}
          </p>
        </div>
      </div>

      {/* Referrals List */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">All Referrals</h2>

        {userReferrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">From</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">To</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Heat</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userReferrals.map((ref: any) => (
                  <tr key={ref._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(ref.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm">{getMemberName(ref.from_member)}</td>
                    <td className="py-3 px-4 text-sm">{getMemberName(ref.to_member)}</td>
                    <td className="py-3 px-4 text-sm font-semibold">{ref.contact_name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{ref.referral_type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${ref.heat === 'Hot' ? 'bg-red-500/20 text-red-300' :
                        ref.heat === 'Warm' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                        {ref.heat}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${ref.status === 'Closed' ? 'bg-green-500/20 text-green-300' :
                        ref.status === 'Approved' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {/* Only show action for the receiver and if not closed */}
                      {ref.to_member === user?.id && ref.status !== 'Closed' && (
                        <button
                          onClick={() => handleRecordRevenue(ref)}
                          className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-2 py-1 rounded transition"
                        >
                          Record Business
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No referrals yet</p>
          </div>
        )}
      </div>

      <RecordRevenueModal
        open={isRevenueModalOpen}
        onOpenChange={setIsRevenueModalOpen}
        referral={selectedReferral}
        onSuccess={handleRevenueSuccess}
      />
    </div>
  );
}

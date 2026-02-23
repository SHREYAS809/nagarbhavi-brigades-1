'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { Eye, Gift } from 'lucide-react';
import { RecordRevenueModal } from '@/components/dashboard/modals/record-revenue-modal';
import { EditReferralModal } from '@/components/dashboard/modals/edit-referral-modal';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { ReferralDetailsModal } from '@/components/dashboard/modals/referral-details-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function MyReferralsPage() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: '' });

  useEffect(() => {
    async function fetchData() {
      if (user?.token) {
        try {
          const [refs, usrs] = await Promise.all([
            api.getReferrals(user.token, filters),
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
  }, [user, filters]);

  const fetchData = async () => {
    if (user?.token) {
      const refs = await api.getReferrals(user.token);
      setReferrals(refs);
    }
  };

  const getMember = (id: string) => {
    return members.find((u: any) => String(u.id) === String(id) || String(u._id) === String(id));
  };

  const getMemberName = (id: string) => {
    const m = getMember(id);
    return m ? m.name : 'Unknown';
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading referrals...</div>;

  // Filter for Referrals Given only
  const referralsGiven = referrals.filter((r: any) => r.from_member === user?.id);

  const handleRecordRevenue = (referral: any) => {
    setSelectedReferral(referral);
    setIsRevenueModalOpen(true);
  };

  const handleRevenueSuccess = () => {
    fetchData();
  };

  const handleEditClick = () => {
    if (!selectedReferralId) {
      alert("Please select a referral slip to edit/delete.");
      return;
    }
    const ref = referrals.find(r => String(r.id) === String(selectedReferralId) || String(r._id) === String(selectedReferralId));
    if (ref) {
      setSelectedReferral(ref);
      setIsEditModalOpen(true);
    }
  };

  const handleViewDetails = (e: React.MouseEvent, referral: any) => {
    e.stopPropagation();
    setSelectedReferral(referral);
    setIsDetailsModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchData();
    setSelectedReferralId(null);
  };

  const handleExport = (withHeaders = true) => {
    const headers = ['Date', 'To', 'Referral', 'Type', 'Status', 'Phone', 'Email', 'Comments', 'Heat'];
    const rows = referralsGiven.map((r: any) => [
      new Date(r.created_at).toLocaleDateString(),
      getMemberName(r.to_member),
      r.contact_name,
      r.referral_type,
      r.status,
      r.phone,
      r.email,
      `"${r.comments}"`,
      r.heat
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + (withHeaders ? headers.join(",") + "\n" : "")
      + rows.map((e: any[]) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "referrals_given.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 print:p-0">
      {/* Report Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold gold-text">Referrals Given</h1>
          <p className="text-muted-foreground text-sm">Track referrals you have sent to other members.</p>
        </div>
      </div>

      {/* Filters */}
      <FilterBar onFilterChange={setFilters} placeholder="Search referrals and contacts..." />

      {/* Report Container */}
      <div className="glass-card overflow-hidden border-white/10 print:shadow-none print:border-none print:bg-white print:text-black">

        {/* Info Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex flex-wrap justify-between items-center gap-4 text-sm print:bg-white print:border-none">
          <div>
            <span className="block font-bold text-lg text-foreground print:text-black">Chapter : Referrals Given Report</span>
            <div className="grid grid-cols-2 gap-x-8 mt-2 text-xs text-muted-foreground print:text-gray-600">
              <div>Running User</div>
              <div className="font-semibold text-foreground print:text-black">{user?.name || 'Member'}</div>
              <div>Run At</div>
              <div className="font-semibold text-foreground print:text-black">{new Date().toLocaleString()}</div>
              <div>Chapter</div>
              <div className="font-semibold text-foreground print:text-black">Nagarbhavi Brigades</div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap print:hidden">
            <button onClick={handleEditClick} className={`text-xs px-3 py-1.5 rounded font-medium shadow-sm transition-all ${selectedReferralId ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>Edit / Delete Slips</button>
            <button onClick={() => handleExport(false)} className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs px-3 py-1.5 rounded font-medium transition-all">Export without Headers</button>
            <button onClick={() => handleExport(true)} className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs px-3 py-1.5 rounded font-medium transition-all">Export</button>
            <button onClick={handlePrint} className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs px-3 py-1.5 rounded font-medium transition-all">Print</button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-500/10 text-amber-500 text-[10px] md:text-xs p-3 text-center border-b border-amber-500/20 font-medium print:bg-amber-50 print:text-amber-800 print:border-amber-200">
          Slips associated with PALMS reports that have not been submitted can be edited. If the slip you want to edit has a status of completed, please contact your Vice President to have him/her unlock the report for you.
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-muted-foreground print:bg-gray-100 print:text-black print:border-gray-300">
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Date</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Recipient</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Contact</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Type</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Status</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 print:divide-gray-200 print:text-black">
              {referralsGiven.length > 0 ? (
                referralsGiven.map((ref: any, index: number) => {
                  const isSelected = selectedReferralId === ref._id;
                  return (
                    <tr
                      key={ref._id || ref.id}
                      onClick={() => setSelectedReferralId(isSelected ? null : (ref._id || ref.id))}
                      className={`cursor-pointer transition-colors ${isSelected
                        ? 'bg-primary/10 border-l-2 border-primary print:bg-red-100'
                        : 'hover:bg-white/5 print:hover:bg-gray-50'
                        }`}
                    >
                      <td className="py-3 px-4 text-slate-300 print:text-black">{new Date(ref.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6 border border-white/10">
                            <AvatarImage src={getMember(ref.to_member)?.photo} />
                            <AvatarFallback className="text-[10px]">{getMemberName(ref.to_member).charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground print:text-black">{getMemberName(ref.to_member)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 print:text-black">{ref.contact_name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] border-gold/30 text-gold/80">
                          {ref.referral_type || 'Internal'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-white text-[10px] uppercase tracking-wider font-bold ${ref.status === 'Open' || ref.status === 'New' ? 'bg-blue-600/80' :
                          ref.status === 'Contacted' ? 'bg-yellow-500/80' :
                            ref.status === 'Got The Business' || ref.status === 'Closed' ? 'bg-green-600/80' :
                              ref.status === 'Lost' ? 'bg-red-600/80' :
                                'bg-slate-700'
                          }`}>
                          {ref.status || 'Open'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleViewDetails(e, ref)}
                          className="w-8 h-8 text-gold hover:bg-gold/10"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-muted-foreground print:text-gray-500">
                    No referrals given in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* Page Setup */
          @page {
            size: landscape;
            margin: 5mm;
          }

          /* Force White Background Everywhere */
          html, body, div, span, applet, object, iframe,
          h1, h2, h3, h4, h5, h6, p, blockquote, pre,
          a, abbr, acronym, address, big, cite, code,
          del, dfn, em, img, ins, kbd, q, s, samp,
          small, strike, strong, sub, sup, tt, var,
          b, u, i, center,
          dl, dt, dd, ol, ul, li,
          fieldset, form, label, legend,
          table, caption, tbody, tfoot, thead, tr, th, td,
          article, aside, canvas, details, embed, 
          figure, figcaption, footer, header, hgroup, 
          menu, nav, output, ruby, section, summary,
          time, mark, audio, video {
            background-color: white !important;
            color: black !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          /* Explicitly Hide UI Elements */
          nav, aside, header, .sidebar, .navbar, .no-print, 
          input, select, .hidden-print, .print\:hidden
          {
            display: none !important;
          }
          
          /* Hide Buttons explicitly */
          button {
            display: none !important;
          }

          /* Layout Resets for Print */
          body {
            position: relative;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            zoom: 60%; /* Safe zoom for landscape */
            overflow: visible !important;
          }

          /* Ensure Main Content is Visible and Full Width */
          main, .flex-1, #root, #__next {
             display: block !important;
             width: 100% !important;
             margin: 0 !important;
             padding: 0 !important;
             overflow: visible !important;
          }

          /* Table Styling */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important; 
            font-size: 10px !important;
          }

          th, td {
            border: 1px solid #000 !important; /* Start black border */
            padding: 4px !important;
            word-wrap: break-word !important;
          }

          /* Column Widths to Ensure Fit */
          th:nth-child(1), td:nth-child(1) { width: 7%; }
          th:nth-child(2), td:nth-child(2) { width: 9%; }
          th:nth-child(3), td:nth-child(3) { width: 9%; }
          th:nth-child(4), td:nth-child(4) { width: 8%; }
          th:nth-child(5), td:nth-child(5) { width: 8%; }
          th:nth-child(6), td:nth-child(6) { width: 9%; }
          th:nth-child(7), td:nth-child(7) { width: 14%; word-break: break-all; }
          th:nth-child(8), td:nth-child(8) { width: 15%; }
          th:nth-child(9), td:nth-child(9) { width: 5%; text-align: center; }
          th:nth-child(10), td:nth-child(10) { width: 8%; }
          th:nth-child(11), td:nth-child(11) { width: 8%; }

          /* Visual Cleanup */
          .rounded-full {
             border: 1px solid black !important;
             color: black !important;
          }
        }
      `}</style>

      <RecordRevenueModal
        open={isRevenueModalOpen}
        onOpenChange={setIsRevenueModalOpen}
        referral={selectedReferral}
        onSuccess={handleRevenueSuccess}
      />

      <EditReferralModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        referral={selectedReferral}
        onSuccess={handleEditSuccess}
        members={members}
      />

      <ReferralDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        referral={selectedReferral}
        members={members}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MapPin, Clock, Users, CheckCircle, Video, Globe, Home, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CreateMeetingModal } from '@/components/dashboard/modals/create-meeting-modal';

export default function MeetingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchData = async () => {
    if (user?.token) {
      try {
        const [mtgs, usrs] = await Promise.all([
          api.getMeetings(user.token, filters),
          api.getUsers(user.token)
        ]);
        setMeetings(mtgs);
        setMembers(usrs);
      } catch (error) {
        console.error("Failed to fetch meetings", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, filters]);

  const handleRegister = async (id: string) => {
    try {
      await api.registerMeeting(user?.token || '', id);
      toast({ title: 'Success', description: 'Registered for meeting successfully!' });
      // Update local state to show registered status immediately? 
      // We'd need to add user ID to participants list locally.
      setMeetings(meetings.map(m =>
        m._id === id
          ? { ...m, participants: [...(m.participants || []), { id: user?.id, name: user?.name, email: user?.email }] }
          : m
      ));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to register', variant: 'destructive' });
    }
  };

  const isRegistered = (meeting: any) => {
    return meeting.participants?.some((p: any) => String(p.id || p._id) === String(user?.id));
  };

  const getMember = (id: string) => members.find(m => String(m.id || m._id) === String(id));

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading meetings...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gold-text mb-2">Chapter Meetings</h1>
          <p className="text-muted-foreground">
            Networking events, workshops, and weekly brigade meetings.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 px-6 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      <FilterBar onFilterChange={setFilters} placeholder="Filter meetings..." />

      {/* Meetings Grid */}
      {meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetings.map((meeting) => (
            <div key={meeting._id || meeting.id} className="glass-card-hover border-white/10 overflow-hidden flex flex-col group">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2 py-0.5 ${meeting.meeting_mode === 'Online' ? 'border-blue-500/50 text-blue-400 bg-blue-500/5' :
                        meeting.meeting_mode === 'Hybrid' ? 'border-purple-500/50 text-purple-400 bg-purple-500/5' :
                          'border-orange-500/50 text-orange-400 bg-orange-500/5'
                        }`}>
                        {meeting.meeting_mode || 'In-Person'}
                      </Badge>
                      {meeting.meeting_mode !== 'In-Person' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{meeting.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <Avatar className="w-12 h-12 border-2 border-white/5 shadow-inner">
                      <AvatarImage src={getMember(meeting.organizer_id)?.photo} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">{getMember(meeting.organizer_id)?.name?.charAt(0) || 'O'}</AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] text-muted-foreground mt-1">Organizer</span>
                  </div>
                </div>

                {/* Meeting Details */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      {meeting.date_time ? new Date(meeting.date_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      {meeting.date_time ? new Date(meeting.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin className="w-3.5 h-3.5 text-gold" />
                      <span className="truncate" title={meeting.location}>{meeting.location || 'Online'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Users className="w-3.5 h-3.5 text-gold" />
                      {meeting.participants?.length || 0} Brigade Members
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto p-4 bg-white/[0.02] border-t border-white/5 flex gap-2">
                {isRegistered(meeting) ? (
                  <Button
                    variant="outline"
                    className="flex-1 bg-green-500/10 border-green-500/30 text-green-400 h-10 text-xs font-bold"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    REGISTERED
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleRegister(meeting._id || meeting.id)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-xs font-bold transition-all"
                  >
                    REGISTER NOW
                  </Button>
                )}

                {meeting.meet_link && (
                  <Button
                    variant="outline"
                    className="border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 text-gray-400 hover:text-blue-400 h-10 px-3 transition-all"
                    asChild
                  >
                    <a href={meeting.meet_link} target="_blank" rel="noopener noreferrer">
                      <Video className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No upcoming meetings</p>
        </div>
      )}

      <CreateMeetingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}

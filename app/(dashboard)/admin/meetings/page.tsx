'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { CreateMeetingModal } from '@/components/dashboard/modals/create-meeting-modal';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { ViewParticipantsModal } from '@/components/dashboard/modals/view-participants-modal';
import { Badge } from '@/components/ui/badge';
import { Video } from 'lucide-react';

export default function AdminMeetingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (user?.token) {
        try {
          const [mtgs, usrs] = await Promise.all([
            api.getMeetings(user.token),
            api.getUsers(user.token)
          ]);
          setMeetings(mtgs);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await api.deleteMeeting(user?.token || '', id);
      toast({ title: 'Success', description: 'Meeting deleted' });
      setMeetings(meetings.filter(m => m._id !== id));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete meeting', variant: 'destructive' });
    }
  };

  const handleMeetingCreated = () => {
    if (user?.token) {
      api.getMeetings(user.token).then(setMeetings);
    }
  };

  const getMemberName = (id: string) => {
    const m = members.find((u: any) => u._id === id); // Fix: use _id not id
    return m ? m.name : 'Unknown';
  };

  const handleViewParticipants = (meeting: any) => {
    setSelectedMeeting(meeting);
    setIsParticipantsModalOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading meetings...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Meetings Management</h1>
          <p className="text-muted-foreground">
            Organize and manage all chapter meetings and events
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create Meeting
        </Button>
      </div>

      {/* Meetings List */}
      {meetings.length > 0 ? (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div key={meeting._id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">{meeting.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{meeting.description}</p>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2 py-0.5 ${meeting.meeting_mode === 'Online' ? 'border-blue-500/50 text-blue-400 bg-blue-500/5' :
                      meeting.meeting_mode === 'Hybrid' ? 'border-purple-500/50 text-purple-400 bg-purple-500/5' :
                        'border-orange-500/50 text-orange-400 bg-orange-500/5'
                      }`}>
                      {meeting.meeting_mode || 'In-Person'}
                    </Badge>
                    {meeting.meeting_mode !== 'In-Person' && meeting.meet_link && (
                      <a
                        href={meeting.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors ml-2"
                      >
                        <Video className="w-3 h-3" />
                        Join Meet
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      {meeting.date_time ? new Date(meeting.date_time).toLocaleDateString() : 'TBD'}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-4 h-4 text-primary">🕐</span>
                      {meeting.date_time ? new Date(meeting.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      {meeting.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => handleViewParticipants(meeting)}>
                      <Users className="w-4 h-4 text-primary" />
                      <span className="underline decoration-dotted underline-offset-4">
                        {meeting.participants?.length || 0} registered
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewParticipants(meeting)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                    title="View Participants"
                  >
                    <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(meeting._id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                    title="Delete Meeting"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                  </button>
                </div>
              </div>

              {/* Organizer */}
              <div className="text-xs text-muted-foreground border-t border-white/10 pt-4">
                Organized by: <span className="text-foreground font-semibold">
                  {getMemberName(meeting.organizer_id)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No meetings scheduled</p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Create First Meeting
          </Button>
        </div>
      )}

      <CreateMeetingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleMeetingCreated}
      />

      <ViewParticipantsModal
        open={isParticipantsModalOpen}
        onOpenChange={setIsParticipantsModalOpen}
        meeting={selectedMeeting}
        members={members}
      />
    </div>
  );
}

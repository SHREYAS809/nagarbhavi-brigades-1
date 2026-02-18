'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { CreateMeetingModal } from '@/components/dashboard/modals/create-meeting-modal';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminMeetingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const handleMeetingCreated = (newMeeting: any) => {
    // If backend returns the inserted object with _id, use it. 
    // If result is from insert_oneResult, we might need to refetch or assume structure.
    // Usually my API wrapper returns json. If Flask returns `mongo.db.insert_one` result converted to json, 
    // it might just contain `inserted_id`.
    // Let's assume we need to re-fetch to be safe OR construct object.
    // Easiest is to reload list or push if we know structure.
    // Optimistic update:
    // But we don't know _id if backend only returns { message: 'success' }.
    // Let's check backend route `create_meeting`.
    // It returns: jsonify({'message': 'Meeting created successfully', 'id': str(result.inserted_id)}), 201
    // So we have ID. We can construct object.
    // But simpler to just re-fetch for now or add dummy.
    // For now, let's re-fetch.
    if (user?.token) {
      api.getMeetings(user.token).then(setMeetings);
    }
  };

  const getMemberName = (id: string) => {
    const m = members.find((u: any) => u.id === id);
    return m ? m.name : 'Unknown';
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
          className="bg-primary hover:bg-primary/90 text-primary-foreground hidden md:flex gap-2"
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
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      {meeting.registrants?.length || 0} registered
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition">
                    <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </button>
                  {/* Edit not implemented yet */}
                  {/* <button className="p-2 hover:bg-white/10 rounded-lg transition">
                    <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </button> */}
                  <button
                    onClick={() => handleDelete(meeting._id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
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
    </div>
  );
}

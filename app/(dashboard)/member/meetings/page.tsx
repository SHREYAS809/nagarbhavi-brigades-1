'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MeetingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (user?.token) {
      try {
        const mtgs = await api.getMeetings(user.token);
        setMeetings(mtgs);
      } catch (error) {
        console.error("Failed to fetch meetings", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

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
    return meeting.participants?.some((p: any) => p.id === user?.id);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading meetings...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Meetings & Events</h1>
          <p className="text-muted-foreground">
            Upcoming networking meetings and events
          </p>
        </div>
        {/* Member can't create, only view/register */}
      </div>

      {/* Meetings Grid */}
      {meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetings.map((meeting) => (
            <div key={meeting._id} className="glass-card-hover p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">{meeting.title}</h3>
                  <p className="text-sm text-muted-foreground">{meeting.description}</p>
                </div>
              </div>

              {/* Meeting Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  {meeting.date_time ? new Date(meeting.date_time).toLocaleDateString() : 'TBD'}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  {meeting.date_time ? new Date(meeting.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  {meeting.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  {meeting.participants?.length || 0} registered
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                {isRegistered(meeting) ? (
                  <Button
                    variant="outline"
                    className="flex-1 border-green-500/50 text-green-400 cursor-default hover:bg-transparent hover:text-green-400"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Registered
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleRegister(meeting._id)}
                    variant="outline"
                    className="flex-1"
                  >
                    Register
                  </Button>
                )}

                {/* View Details could open a modal, but standard card is info enough for now */}
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
    </div>
  );
}

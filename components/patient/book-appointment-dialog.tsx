'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { bookAppointment } from '@/lib/patient-actions';
import { createClient } from '@/lib/supabase/client';

export default function BookAppointmentDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('doctor_profiles')
        .select('id, specialization, profiles!inner(full_name)')
        .eq('is_accepting_patients', true);
      setDoctors(data || []);
    };
    if (open) fetchDoctors();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await bookAppointment({
        doctorId: selectedDoctor,
        appointmentDate: date,
        appointmentTime: time,
        reason,
      });
      setOpen(false);
      setSelectedDoctor('');
      setDate('');
      setTime('');
      setReason('');
    } catch (error: any) {
      alert(error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctor">Select Doctor *</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    Dr. {doc.profiles.full_name} - {doc.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Appointment Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Appointment Time *</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit *</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Regular checkup, Fever, etc."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

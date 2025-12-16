'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateDoctorSchedule } from '@/lib/doctor-actions';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ScheduleForm({ doctorProfile }: { doctorProfile: any }) {
  const [loading, setLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState<string[]>(doctorProfile?.available_days || []);
  const [startTime, setStartTime] = useState(doctorProfile?.available_start_time || '09:00');
  const [endTime, setEndTime] = useState(doctorProfile?.available_end_time || '17:00');
  const [accepting, setAccepting] = useState(doctorProfile?.is_accepting_patients ?? true);

  const toggleDay = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoctorSchedule({
        availableDays,
        availableStartTime: startTime,
        availableEndTime: endTime,
        isAcceptingPatients: accepting,
      });
      alert('Schedule updated successfully!');
    } catch (error) {
      console.error('Schedule update error:', error);
      alert('Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label>Available Days</Label>
        <div className="grid grid-cols-2 gap-2">
          {DAYS.map(day => (
            <Button
              key={day}
              type="button"
              variant={availableDays.includes(day) ? 'default' : 'outline'}
              onClick={() => toggleDay(day)}
              className="capitalize"
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="accepting"
          checked={accepting}
          onChange={(e) => setAccepting(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="accepting" className="cursor-pointer">
          Currently accepting new patients
        </Label>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Schedule'}
      </Button>
    </form>
  );
}

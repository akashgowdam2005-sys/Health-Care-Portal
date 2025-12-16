'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cancelAppointment } from '@/lib/patient-actions';

export default function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    setLoading(true);
    try {
      await cancelAppointment(appointmentId);
    } catch (error) {
      alert('Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleCancel} disabled={loading}>
      {loading ? 'Cancelling...' : 'Cancel Appointment'}
    </Button>
  );
}

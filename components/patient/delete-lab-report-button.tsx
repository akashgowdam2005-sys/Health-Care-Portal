'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteLabReport } from '@/lib/patient-actions';

export default function DeleteLabReportButton({
  reportId,
  filePath,
}: {
  reportId: string;
  filePath: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    setLoading(true);
    try {
      await deleteLabReport(reportId, filePath);
    } catch (error) {
      alert('Failed to delete report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

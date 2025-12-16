'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import PrescriptionPDF from './prescription-pdf';

export default function DownloadPrescriptionButton({
  prescription,
  appointment,
  doctor,
}: {
  prescription: any;
  appointment: any;
  doctor: any;
}) {
  const handleDownload = async () => {
    const blob = await pdf(
      <PrescriptionPDF
        prescription={prescription}
        appointment={appointment}
        doctor={doctor}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prescription-${appointment.appointment_date}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button size="sm" variant="outline" onClick={handleDownload}>
      <Download className="h-4 w-4 mr-2" />
      Download PDF
    </Button>
  );
}

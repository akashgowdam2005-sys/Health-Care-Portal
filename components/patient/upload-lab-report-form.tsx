'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { uploadLabReport } from '@/lib/patient-actions';

export default function UploadLabReportForm() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadLabReport(formData);
      setFile(null);
      (e.target as HTMLFormElement).reset();
      alert('Lab report uploaded successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to upload report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Select PDF File *</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Upload your lab reports in PDF format (max 10MB)
        </p>
      </div>

      <Button type="submit" disabled={loading || !file}>
        <Upload className="h-4 w-4 mr-2" />
        {loading ? 'Uploading...' : 'Upload Report'}
      </Button>
    </form>
  );
}

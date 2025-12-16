import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import UploadLabReportForm from '@/components/patient/upload-lab-report-form';
import DeleteLabReportButton from '@/components/patient/delete-lab-report-button';

export default async function LabReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: reports } = await supabase
    .from('lab_reports')
    .select('*')
    .eq('patient_id', user.id)
    .order('uploaded_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Lab Reports</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadLabReportForm />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {reports?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No lab reports uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          reports?.map((report: any) => (
            <Card key={report.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.file_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(report.uploaded_at), 'MMM d, yyyy')}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(report.file_size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <DeleteLabReportButton reportId={report.id} filePath={report.file_path} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

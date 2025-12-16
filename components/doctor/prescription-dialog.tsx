'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, FileText } from 'lucide-react';
import { createPrescription } from '@/lib/doctor-actions';

interface Medicine {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function PrescriptionDialog({ appointment }: { appointment: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([
    { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);

  const addMedicine = () => {
    setMedicines([...medicines, { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createPrescription({
        appointmentId: appointment.id,
        diagnosis,
        notes,
        medicines: medicines.filter(m => m.medicine_name && m.dosage),
      });
      setOpen(false);
      setDiagnosis('');
      setNotes('');
      setMedicines([{ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    } catch (error) {
      console.error('Prescription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Prescribe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Prescription - {appointment.patient?.full_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis *</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g., Acute Bronchitis"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional observations..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Medicines *</Label>
              <Button type="button" size="sm" variant="outline" onClick={addMedicine}>
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>

            {medicines.map((med, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Medicine {index + 1}</span>
                  {medicines.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMedicine(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>Medicine Name *</Label>
                    <Input
                      value={med.medicine_name}
                      onChange={(e) => updateMedicine(index, 'medicine_name', e.target.value)}
                      placeholder="e.g., Amoxicillin"
                      required
                    />
                  </div>
                  <div>
                    <Label>Dosage *</Label>
                    <Input
                      value={med.dosage}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg"
                      required
                    />
                  </div>
                  <div>
                    <Label>Frequency *</Label>
                    <Input
                      value={med.frequency}
                      onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                      placeholder="e.g., 3 times daily"
                      required
                    />
                  </div>
                  <div>
                    <Label>Duration *</Label>
                    <Input
                      value={med.duration}
                      onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                      placeholder="e.g., 7 days"
                      required
                    />
                  </div>
                  <div>
                    <Label>Instructions</Label>
                    <Input
                      value={med.instructions}
                      onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                      placeholder="e.g., After meals"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Complete & Prescribe'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

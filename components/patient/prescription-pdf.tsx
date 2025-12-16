import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#0284C7',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0284C7',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748B',
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 3,
  },
  text: {
    fontSize: 11,
    color: '#1E293B',
    marginBottom: 2,
  },
  medicineBox: {
    backgroundColor: '#F1F5F9',
    padding: 10,
    marginBottom: 8,
    borderRadius: 4,
  },
  medicineName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  medicineDetails: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    fontSize: 9,
    color: '#94A3B8',
  },
});

export default function PrescriptionPDF({
  prescription,
  appointment,
  doctor,
}: {
  prescription: any;
  appointment: any;
  doctor: any;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>VitalSync</Text>
          <Text style={styles.subtitle}>Medical Prescription</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Doctor Information</Text>
          <Text style={styles.text}>Dr. {doctor.full_name}</Text>
          <Text style={styles.text}>Date: {appointment.appointment_date}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Diagnosis</Text>
          <Text style={styles.text}>{prescription.diagnosis}</Text>
        </View>

        {prescription.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>Clinical Notes</Text>
            <Text style={styles.text}>{prescription.notes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Prescribed Medicines</Text>
          {prescription.medicines?.map((med: any, index: number) => (
            <View key={med.id} style={styles.medicineBox}>
              <Text style={styles.medicineName}>
                {index + 1}. {med.medicine_name}
              </Text>
              <Text style={styles.medicineDetails}>Dosage: {med.dosage}</Text>
              <Text style={styles.medicineDetails}>Frequency: {med.frequency}</Text>
              <Text style={styles.medicineDetails}>Duration: {med.duration}</Text>
              {med.instructions && (
                <Text style={styles.medicineDetails}>Instructions: {med.instructions}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>This is a computer-generated prescription from VitalSync Healthcare Portal.</Text>
          <Text>For any queries, please contact your healthcare provider.</Text>
        </View>
      </Page>
    </Document>
  );
}

import { MedicationRecord } from '../types';

export const mockMedications: MedicationRecord[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: { amount: 1, unit: 'tablet' },
    timing: { morning: true, noon: false, night: false },
    withFood: false,
    instructions: 'Take one tablet by mouth once daily in the morning without food',
    scannedAt: new Date(2026, 2, 1, 9, 30),
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: { amount: 2, unit: 'tablets' },
    timing: { morning: true, noon: false, night: true },
    withFood: true,
    instructions: 'Take two tablets by mouth twice daily with meals',
    scannedAt: new Date(2026, 2, 1, 8, 15),
  },
  {
    id: '3',
    name: 'Vitamin D3',
    dosage: { amount: 1, unit: 'capsule' },
    timing: { morning: true, noon: false, night: false },
    withFood: null,
    instructions: 'Take one capsule by mouth once daily',
    scannedAt: new Date(2026, 1, 28, 10, 45),
  },
];

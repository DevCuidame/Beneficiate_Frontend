import { User } from "./auth.interface";
import { Beneficiary } from "./beneficiary.interface";

export interface Appointment {
  id: number;
  user_id: string;
  beneficiary_id: string;
  appointment_date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'EXPIRED';
  notes: string;
  specialty: string;
  created_at: string;
  is_for_beneficiary: boolean;
  firstTime: boolean;
  control: boolean;
  userData: User | Beneficiary; 
}

export interface appointmentCounts {
  EXPIRED: number;
  PENDING: number;
  CONFIRMED: number;
  CANCELLED: number;
  RESCHEDULED: number;
}
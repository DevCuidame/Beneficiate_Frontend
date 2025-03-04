import { User } from "./auth.interface";
import { Beneficiary } from "./beneficiary.interface";

export interface Appointment {
  id: number;
  user_id: string;
  beneficiary_id: string;
  professional_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'EXPIRED' | 'TO_BE_CONFIRMED';
  notes: string;
  specialty: string;
  created_at: string;
  created_at_formatted: string;
  is_for_beneficiary: boolean;
  first_time: boolean;
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

export interface AppointmentResponse {
  message: string;
  data: Appointment;
  statusCode: number;
}
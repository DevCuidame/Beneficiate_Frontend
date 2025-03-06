import { User } from "./auth.interface";
import { Beneficiary } from "./beneficiary.interface";
import { MedicalProfessional } from "./medicalProfessional.interface";
import { MedicalSpecialty, MedicalSpecialtyResponse } from "./medicalSpecialty.interface";

export interface Appointment {
  id: number;
  user_id: string;
  beneficiary_id: string;
  professional_id: string;
  specialty_id: string;
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
  userData: any; 
  specialtyData: MedicalSpecialty;
  professionalData: MedicalProfessional;
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
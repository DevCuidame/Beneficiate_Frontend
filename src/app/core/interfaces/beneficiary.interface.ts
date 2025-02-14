import { Location } from './city.interface';
import { BeneficiaryImage, UserImage } from './user.interface';

export interface Beneficiary {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  identification_type: string;
  identification_number: string;
  phone: string;
  birth_date?: string;
  gender: string;
  city_id: number;
  address: string;
  blood_type: string;
  health_provider?: string;
  prepaid_health?: string;
  work_risk_insurance?: string;
  funeral_insurance?: string;
  removed: boolean;
  location: Location;
  image: BeneficiaryImage;
  allergies: Allergy[];
  diseases: Disease[];
  family_history: FamilyHistory[];
  disabilities: Disability[];
  distinctives: Distinctive[];
  medical_history: MedicalHistory[];
  medications: Medication[];
  vaccinations: Vaccination[];
  created_at: string;
}

export interface Distinctive {
  id: number;
  beneficiary_id: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Disability {
  id: number;
  beneficiary_id: number;
  name?: string;
  created_at: Date;
  updated_at: Date;
}

// OK
export interface Allergy {
  id: number;
  beneficiary_id: number;
  allergy_type: string;
  description: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  created_at: Date;
  updated_at: Date;
}
//Ok
export interface MedicalHistory {
  id: number;
  beneficiary_id: number;
  history_type: string;
  description: string;
  history_date: Date;
  created_at: Date;
  updated_at: Date;
}
//OK
export interface FamilyHistory {
  id: number;
  beneficiary_id: number;
  history_type: string;
  relationship: string;
  description: string;
  history_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Disease {
  id: number;
  beneficiary_id: number;
  disease: string;
  diagnosed_date: Date;
  treatment_required: boolean;
  created_at: Date;
  updated_at: Date;
}
// OK
export interface Medication {
  id: number;
  beneficiary_id: number;
  medication: string;
  laboratory: string;
  prescription: string;
  dosage: string;
  frequency: string;
  created_at: Date;
  updated_at: Date;
}

export interface Vaccination {
  id: number;
  beneficiary_id: number;
  vaccine: string;
  vaccination_date: Date;
  created_at: Date;
  updated_at: Date;
}

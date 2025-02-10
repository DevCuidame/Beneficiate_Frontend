import { Location } from "./city.interface";
import { BeneficiaryImage, UserImage } from "./user.interface";

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
    location: Location,
    image: BeneficiaryImage,
    created_at: string; 
  }
  
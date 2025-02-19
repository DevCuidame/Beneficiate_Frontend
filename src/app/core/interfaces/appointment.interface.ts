export interface Appointment {
    id?: number;                  
    user_id: number | null;       
    beneficiary_id?: number | null; 
    appointment_date: string;      
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'; 
    notes?: string;                
    is_for_beneficiary: boolean;   
    created_at?: string;           
  }
  
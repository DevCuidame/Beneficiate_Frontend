// src/app/core/interfaces/auth.interface.ts
export interface RegisterData {
    first_name: string;
    last_name: string;
    identification_type: string;
    identification_number: string;
    address: string;
    city_id: number;
    phone: string;
    email: string;
    password: string;
    public_name?: string;
    base_64?: string;
  }
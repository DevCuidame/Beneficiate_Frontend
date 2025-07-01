export interface ApiResponse<T> {
  message: string;
  data: T;
  statusCode: number;
}

export interface StatsData {
  totalUsers: number;
  individualPlan: number;
  familyPlan: number;
}

export interface PlanOption {
  label: string;
  value: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  verified: boolean;
  identification_type: string;
  identification_number: string;
  gender: string;
  created_at: string;
  city_name: string;
  department_name: string;
  plan_name: string | null;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: string;
  duration_days: number;
  max_beneficiaries: number;
  is_active: boolean;
  created_at: Date;
  code: string;
}

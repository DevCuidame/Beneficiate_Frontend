import { City, Location } from './city.interface';
import { Plan } from './plan.interface';
import { UserImage } from './user.interface';

// Interfaz para el registro del usuario
export interface RegisterData {
  first_name: string;
  last_name: string;
  identification_type: string;
  identification_number: string;
  address: string;
  city: City; 
  phone: string;
  birth_date: string;
  gender: string;
  email: string;
  password: string;
  public_name?: string;
  base_64?: string;
}

// Interfaz para el usuario autenticado
export interface User extends RegisterData {
  id: number; 
  image_path: string;
  plan: Plan;     
  image: UserImage; 
  location: Location;
}

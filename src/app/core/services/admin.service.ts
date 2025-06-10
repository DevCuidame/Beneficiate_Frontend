import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const apiUrl = environment.url;

interface ApiResponse<T> {
  message: string;
  data: T;
  statusCode: number;
}

interface User {
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


@Injectable({ providedIn: 'root' })
export class AdminService {

  constructor(private http: HttpClient) {}

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${apiUrl}api/v1/admin/users`).pipe(
      catchError((error) => {
        console.error('Error fetching users:', error);
        return throwError(() => ({
          status: error.status,
          error: error.error,
          message: error.error?.error || 'Failed to fetch users',
        }));
      })
    );
  }

}

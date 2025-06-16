import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User, Plan, ApiResponse } from '../interfaces/admin.interface';

const apiUrl = environment.url;


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

  getPlans(): Observable<ApiResponse<Plan[]>> {
    return this.http.get<ApiResponse<Plan[]>>(`${apiUrl}api/v1/admin/plans`).pipe(
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
  createPlan(planForm: Plan): Observable<ApiResponse<Plan[]>> {
    return this.http.post(`${apiUrl}api/v1/admin/plan`, planForm).pipe(
      map(response => {
        return response as ApiResponse<Plan[]>;
      }),
      catchError((error) => {
        console.error('Error creating plan:', error);
        return throwError(() => ({
          status: error.status,
          error: error.error,
          message: error.error?.error || 'Failed to create plan',
        }));
      })
    );
  }

  updatePlan(planForm: Plan): Observable<ApiResponse<Plan[]>> {
    return this.http.put(`${apiUrl}api/v1/admin/plan`, planForm).pipe(
      map(response => {
        return response as ApiResponse<Plan[]>;
      }),
      catchError((error) => {
        console.error('Error creating plan:', error);
        return throwError(() => ({
          status: error.status,
          error: error.error,
          message: error.error?.error || 'Failed to create plan',
        }));
      })
    );
  }

}

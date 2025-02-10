// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RegisterData, User } from 'src/app/core/interfaces/auth.interface';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { BeneficiaryService } from './beneficiary.service';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
const apiUrl = environment.url;


@Injectable({ providedIn: 'root' })
export class AuthService {
  
  private authState = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient,  private userService: UserService, private beneficiaryService: BeneficiaryService) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${apiUrl}api/v1/auth/login`, credentials).pipe(
      map((response: any) => {
        localStorage.setItem('token', response.data.token);
        this.authState.next(true);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.userService.setUser(response.data.user as User);

         // Guardar beneficiarios
         if (response.data.beneficiaries) {
          localStorage.setItem('beneficiaries', JSON.stringify(response.data.beneficiaries));
          this.beneficiaryService.setBeneficiaries(response.data.beneficiaries as Beneficiary[]);
        }

        return response;
      })
    );
  }

  register(credentials: RegisterData): Observable<any> {
    return this.http.post(`${apiUrl}api/v1/auth/register`, credentials);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('beneficiaries');
    this.authState.next(false);
    this.userService.clearUser();
    this.beneficiaryService.clearBeneficiaries();
  }

  getBeneficiariesData(): Beneficiary[] {
    return JSON.parse(localStorage.getItem('beneficiaries') || '[]');
  }

  getUserData(): any {
    return JSON.parse(localStorage.getItem('user') || 'null'); 
  }

  isAuthenticated(): boolean {
    return this.authState.value;
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${apiUrl}api/v1/auth/refresh-token`, {}).pipe(
      map((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          return response;
        } else {
          throw new Error('No se recibió un nuevo token');
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(error);
      })
    );
  }
  

  refreshUserData(): void {
    const user = this.getUserData();
    if (user) {
      this.userService.setUser(user);
    }

    const beneficiaries = this.getBeneficiariesData();
    if (beneficiaries.length > 0) {
      this.beneficiaryService.setBeneficiaries(beneficiaries);
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}

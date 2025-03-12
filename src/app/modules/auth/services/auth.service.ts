// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RegisterData, User } from 'src/app/core/interfaces/auth.interface';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryService } from '../../../core/services/beneficiary.service';
import { NavController } from '@ionic/angular';
const apiUrl = environment.url;


@Injectable({ providedIn: 'root' })
export class AuthService {

  private authState = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private userService: UserService, private beneficiaryService: BeneficiaryService, private navController: NavController) {
    this.authState.next(this.hasToken());
  }

  isAuthenticated$(): Observable<boolean> {
    return this.authState.asObservable();
  }


 login(credentials: { email: string; password: string }): Observable<any> {
  return this.http.post(`${apiUrl}api/v1/auth/login`, credentials).pipe(
    map((response: any) => {
      localStorage.setItem('token', response.data.token.accessToken);
      localStorage.setItem('refresh-token', response.data.token.refreshToken);
      this.authState.next(true);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      this.userService.setUser(response.data.user as User);

      if (response.data.plan?.max_beneficiaries) {
        this.beneficiaryService.maxBeneficiariesSubject.next(response.data.plan.max_beneficiaries);
      }

      // Guardar beneficiarios
      if (response.data.beneficiaries) {
        localStorage.setItem('beneficiaries', JSON.stringify(response.data.beneficiaries));
        this.beneficiaryService.setBeneficiaries(response.data.beneficiaries as Beneficiary[]);
      }
      this.authState.next(true);
      console.log('🔥 authState actualizado a TRUE');

      return response;
    }),
    catchError(error => {
      // Simplemente registra y pasa el error HTTP tal como es
      console.error('Login error:', error);
      
      // Asegúrate de que el error devuelto contenga la información completa
      // del error HTTP, incluyendo status y mensaje de error
      return throwError(() => ({
        status: error.status,
        error: error.error,
        message: error.error?.error || 'Error de autenticación'
      }));
    })
  );
}

  register(credentials: RegisterData): Observable<any> {
    return this.http.post(`${apiUrl}api/v1/auth/register`, credentials);
  }

  /**
 * Reenvía el correo de verificación al usuario
 * @param email Email del usuario
 */
resendVerificationEmail(email: string): Observable<any> {
  return this.http.post(`${apiUrl}api/v1/email/resend`, { email }).pipe(
    catchError(error => {
      console.error('Error al reenviar correo de verificación:', error);
      return throwError(() => error);
    })
  );
}



  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh-token');
    localStorage.removeItem('user');
    localStorage.removeItem('beneficiaries');
    localStorage.removeItem('activeBeneficiary');
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

  isAgent(): boolean {
    const user = this.getUserData();
    return user && user.isAgent === true;
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post(`${apiUrl}api/v1/auth/refresh-token`, { refreshToken }).pipe(
      map((response: any) => {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refresh-token', response.data.refreshToken);
        return response.data;
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  refreshUserData(): void {
    const user = this.getUserData();

    if (user) {
      this.userService.setUser(user);
    } else {
      console.warn('⚠️ No se encontró usuario en localStorage.');
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

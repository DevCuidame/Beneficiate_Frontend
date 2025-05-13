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

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private beneficiaryService: BeneficiaryService,
    private navController: NavController
  ) {
    this.authState.next(this.hasToken());
  }

  isAuthenticated$(): Observable<boolean> {
    return this.authState.asObservable();
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${apiUrl}api/v1/auth/login`, credentials).pipe(
      map((response: any) => {
        // Store tokens
        localStorage.setItem('token', response.data.token.accessToken);
        localStorage.setItem('refresh-token', response.data.token.refreshToken);

        // Set user data in UserService and localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.userService.setUser(response.data.user as User);

        // Set plan details if available
        if (response.data.plan?.max_beneficiaries) {
          this.beneficiaryService.maxBeneficiariesSubject.next(
            response.data.plan.max_beneficiaries
          );
        }

        // Set beneficiaries if available
        if (response.data.beneficiaries) {
          localStorage.setItem(
            'beneficiaries',
            JSON.stringify(response.data.beneficiaries)
          );
          this.beneficiaryService.setBeneficiaries(
            response.data.beneficiaries as Beneficiary[]
          );
        }

        // Update authentication state
        this.authState.next(true);

        return response;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => ({
          status: error.status,
          error: error.error,
          message: error.error?.error || 'Authentication error',
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
      catchError((error) => {
        console.error('Error al reenviar correo de verificación:', error);
        return throwError(() => error);
      })
    );
  }

  public logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh-token');
    localStorage.removeItem('user');
    localStorage.removeItem('beneficiaries');
    localStorage.removeItem('activeBeneficiary');
    localStorage.clear();
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

    return this.http
      .post(`${apiUrl}api/v1/auth/refresh-token`, { refreshToken })
      .pipe(
        map((response: any) => {
          localStorage.setItem('token', response.data.accessToken);
          localStorage.setItem('refresh-token', response.data.refreshToken);
          return response.data;
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  // Add this improved refreshUserData method to your AuthService

  refreshUserData(): void {
    const user = this.getUserData();

    if (user) {
      const normalizedUser = Array.isArray(user) ? user[0] : user;

      if (
        normalizedUser.location &&
        Array.isArray(normalizedUser.location) &&
        normalizedUser.location.length > 0
      ) {
        normalizedUser.location = normalizedUser.location[0];
      }

      this.userService.setUser(normalizedUser);
    }

    const beneficiaries = this.getBeneficiariesData();

    if (beneficiaries.length > 0) {
      this.beneficiaryService.setBeneficiaries(beneficiaries);
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Deletes the user account after password confirmation
   * @param password The user's current password for verification
   * @returns Observable with the deletion response
   */
  deleteAccount(password: string): Observable<any> {
    return this.http
      .delete(`${apiUrl}api/v1/auth/delete-account`, {
        body: { password }, // Send password in request body
      })
      .pipe(
        map((response: any) => {
          // Clear all user data and log out after successful deletion
          this.logout();
          return response;
        }),
        catchError((error) => {
          console.error('Account deletion error:', error);
          return throwError(() => ({
            status: error.status,
            error: error.error,
            message: error.error?.error || 'Error al eliminar la cuenta',
          }));
        })
      );
  }
}

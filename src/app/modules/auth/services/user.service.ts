import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserHealthService } from 'src/app/core/services/user-health.service';
import { environment } from 'src/environments/environment';
export let appInjector: Injector;
@Injectable({ providedIn: 'root' })
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(
    this.getUserFromStorage()
  );
  
  public user$: Observable<User | null> = this.userSubject.asObservable();
  private baseUrl = environment.url;

  constructor(private http: HttpClient) {}

  setUser(userData: User) {
    this.userSubject.next(userData);
  }

  private getUserFromStorage(): User | null {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  findByIdentification(
    identificationType: string,
    identificationNumber: string
  ): Observable<User | null> {
    if (!identificationType || !identificationNumber) {
      return of(null);
    }

    const url = `${this.baseUrl}api/v1/user/identification/${identificationType}/${identificationNumber}`;

    return this.http.get<User>(url).pipe(
      map((response: any) => {
        const userData = response.data || response;
        return userData;
      }),
      catchError((error) => {
        console.error('Error fetching user by identification:', error);
        return of(null);
      })
    );
  }

  updateUserWithHealthData(healthData: any): void {
    const currentUser = this.userSubject.getValue();

    if (!currentUser) {
      return;
    }

    if (Array.isArray(currentUser)) {
      const updatedUser = {
        ...currentUser[0],
        health: healthData,
      };

      this.userSubject.next(updatedUser);
    } else {
      const updatedUser = {
        ...currentUser,
        health: healthData,
      };

      this.userSubject.next(updatedUser);
    }

    localStorage.setItem(
      'userData',
      JSON.stringify(this.userSubject.getValue())
    );
  }

  // Este es un archivo de actualización parcial, añade este método al servicio UserService existente

  // Dentro de la clase UserService, añade este método:
  updateProfile(userData: any): Observable<any> {
    const apiUrl = `${this.baseUrl}api/v1/user/update/${userData.id}`;

    return this.http.put(apiUrl, userData).pipe(
      tap((response: any) => {
        if (response && response.data) {
          // Actualizar el usuario actual en el subject
          const currentUser = this.userSubject.getValue();

          if (Array.isArray(currentUser)) {
            const updatedUsers = currentUser.map((user) =>
              user.id === userData.id ? { ...user, ...response.data } : user
            );
            this.userSubject.next(updatedUsers[0]);
          } else {
            const updatedUser = { ...currentUser, ...response.data };
            this.userSubject.next(updatedUser);
          }

          // Actualizar en localStorage
          localStorage.setItem(
            'userData',
            JSON.stringify(this.userSubject.getValue())
          );
        }
      }),
      catchError((error) => {
        console.error('Error actualizando perfil de usuario:', error);
        return throwError(
          () => new Error(error.message || 'Error al actualizar el perfil')
        );
      })
    );
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  clearUser() {
    this.userSubject.next(null);
  }

  
  // Helper method to load user health data
  getUserHealthData() {
    // const userHealthService = window.Injector.get(UserHealthService);
    // userHealthService.getUserHealthData();
  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { User } from 'src/app/core/interfaces/auth.interface';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public user$: Observable<User | null> = this.userSubject.asObservable();
  private baseUrl = environment.url;

  constructor(private http: HttpClient) {}

  setUser(userData: User) {
    this.userSubject.next(userData);
  }

  private getUserFromStorage(): User | null {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }
  
  findByIdentification(identificationType: string, identificationNumber: string): Observable<User | null> {
    if (!identificationType || !identificationNumber) {
      return of(null);
    }

    const url = `${this.baseUrl}api/v1/user/identification/${identificationType}/${identificationNumber}`;
    
    return this.http.get<User>(url).pipe(
      map((response: any) => {
        const userData = response.data || response;
        return userData;
      }),
      catchError(error => {
        console.error('Error fetching user by identification:', error);
        return of(null);
      })
    );
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  clearUser() {
    this.userSubject.next(null);
  }
}

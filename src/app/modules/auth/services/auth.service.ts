// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { RegisterData } from 'src/app/core/interfaces/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://api.example.com/auth';
  private authState = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      map((response: any) => {
        localStorage.setItem('token', response.token);
        this.authState.next(true);
        return response;
      })
    );
  }

  register(credentials: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.authState.next(false);
  }

  isAuthenticated(): boolean {
    return this.authState.value;
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh-token`, {}).pipe(
      map((response: any) => {
        localStorage.setItem('token', response.token);
        return response;
      })
    );
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}

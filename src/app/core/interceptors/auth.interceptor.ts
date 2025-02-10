// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../modules/auth/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private router: Router, private toastController: ToastController, private authService: AuthService) {}

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    let clonedReq = req;
    
    if (token) {
      clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    
    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(clonedReq, next);
        } else if (error.status === 500) {
          this.presentToast('Error del servidor, intenta más tarde');
        } else if (error.status === 0) {
          this.presentToast('Error de conexión, verifica tu internet');
        }
        return throwError(error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((newToken: any) => {
          this.isRefreshing = false;
          localStorage.setItem('token', newToken.token);
          this.refreshTokenSubject.next(newToken.token);

          // REENVIAR LA SOLICITUD ORIGINAL CON EL NUEVO TOKEN
          return next.handle(req.clone({
            setHeaders: { Authorization: `Bearer ${newToken.token}` }
          }));
        }),
        catchError(refreshError => {
          this.isRefreshing = false;
          this.authService.logout(); // Limpia todo y redirige al login
          this.router.navigate(['/auth/login']);
          return throwError(refreshError);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => next.handle(req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        })))
      );
    }
  }
}

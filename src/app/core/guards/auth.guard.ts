// src/app/modules/auth/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router'; 
import { AuthService } from '../../modules/auth/services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$().pipe(
      take(1),
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          return this.router.createUrlTree(['/auth/login']); 
        }
        return true;
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class AutoRedirectGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$().pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return this.router.createUrlTree(['/home']); // Redirect to home if authenticated
        }
        return true; // Allow access to login/signup if NOT authenticated
      })
    );
  }
}
// src/app/modules/auth/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../modules/auth/services/auth.service';
import { LoadingService } from '../services/loading.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private loadingService: LoadingService) {}

  async canActivate(): Promise<boolean> {
    // await this.loadingService.showLoading('Verificando autenticación...');

    const isAuthenticated = this.authService.isAuthenticated();
    await this.loadingService.hideLoading();

    if (!isAuthenticated) {
      await this.router.navigate(['/auth/login']);
      return false;
    }

    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class AutoRedirectGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private loadingService: LoadingService) {}

  async canActivate(): Promise<boolean> {
    // await this.loadingService.showLoading('Verificando sesión...');

    const isAuthenticated = this.authService.isAuthenticated();
    await this.loadingService.hideLoading();

    if (isAuthenticated) {
      await this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}


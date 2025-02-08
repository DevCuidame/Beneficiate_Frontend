// src/app/modules/auth/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../modules/auth/services/auth.service';

// Redirección automática después de autenticación
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private loadingCtrl: LoadingController) {}

  async canActivate(): Promise<boolean> {
    const loading = await this.loadingCtrl.create({ message: 'Verificando autenticación...' });
    await loading.present();
    
    const isAuthenticated = this.authService.isAuthenticated();
    await loading.dismiss();
    
    if (!isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }
}

// Redirección automática después de autenticación
import { LoadingController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class AutoRedirectGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private loadingCtrl: LoadingController) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const loading = await this.loadingCtrl.create({ message: 'Verificando sesión...' });
    await loading.present();
    
    const isAuthenticated = this.authService.isAuthenticated();
    await loading.dismiss();
    
    if (isAuthenticated) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
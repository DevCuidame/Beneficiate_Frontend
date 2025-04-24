import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PlatformDetectionService } from '../services/platform-detection.service';

@Injectable({
  providedIn: 'root'
})
export class BrowserRedirectGuard implements CanActivate {
  
  constructor(private router: Router, private platformService: PlatformDetectionService) {}
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    const url = state.url;
    
    // Siempre permitir acceso a rutas de reset de contraseña
    if (url.includes('reset-password') || url.includes('new-password')) {
      return true;
    }
    
    // Determinar tipo de dispositivo y plataforma
    const isDesktopBrowser = this.platformService.isDesktopBrowser();
    const isNativeApp = this.platformService.isNativeApp();
    const isMobileBrowser = this.platformService.isMobileBrowser();
    
    // Rutas exclusivas para escritorio
    const desktopOnlyRoutes = ['/home-desktop', '/call-center'];
    
    // Rutas específicas para móvil
    const mobileRoutes = ['/auth', '/home', '/beneficiary', '/user'];
    
    // Ruta base para determinar redirecciones
    const currentRoute = '/' + url.split('/')[1];
    
    // CASO 1: Navegador de escritorio
    if (isDesktopBrowser) {
      if (mobileRoutes.some(route => currentRoute.startsWith(route))) {
        // Redirigir a escritorio si intenta acceder a rutas móviles
        this.router.navigate(['/desktop']);
        return false;
      }
      
      if (url === '/') {
        this.router.navigate(['/desktop']);
        return false;
      }
      
      return true;
    } 
    // CASO 2: Dispositivos móviles (app nativa o navegador)
    else {
      // Los usuarios móviles no pueden acceder a rutas exclusivas de escritorio
      if (desktopOnlyRoutes.some(route => currentRoute.startsWith(route))) {
        this.router.navigate(['/auth/login']);
        return false;
      }
      
      // Permitir acceso a ruta /desktop en navegador móvil
      if (currentRoute === '/desktop' && isMobileBrowser) {
        return true;
      }
      
      // Redirigir rutas de escritorio a auth/login en app nativa
      if (currentRoute === '/desktop' && isNativeApp) {
        this.router.navigate(['/auth/login']);
        return false;
      }
      
      if (url === '/') {
        this.router.navigate(['/auth/login']);
        return false;
      }
      
      return true;
    }
  }
}
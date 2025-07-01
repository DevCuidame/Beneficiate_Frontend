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
    
    // CASO 1: Navegadores (desktop y móvil) - Acceso libre a todas las rutas
    if (isDesktopBrowser || isMobileBrowser) {
      // Solo redirigir la ruta raíz a /desktop para todos los navegadores
      if (url === '/') {
        this.router.navigate(['/desktop']);
        return false;
      }
      
      // Permitir acceso a cualquier otra ruta
      return true;
    } 
    // CASO 2: App nativa de Android - Mantener restricciones
    else if (isNativeApp) {
      // Rutas exclusivas para escritorio (no permitidas en app nativa)
      const desktopOnlyRoutes = ['/home-desktop', '/call-center', '/desktop'];
      
      // Ruta base para determinar redirecciones
      const currentRoute = '/' + url.split('/')[1];
      
      // Los usuarios de app nativa no pueden acceder a rutas exclusivas de escritorio
      if (desktopOnlyRoutes.some(route => currentRoute.startsWith(route))) {
        this.router.navigate(['/auth/login']);
        return false;
      }
      
      // Redirigir ruta raíz a login en app nativa
      if (url === '/') {
        this.router.navigate(['/auth/login']);
        return false;
      }
      
      return true;
    }
    
    // Fallback: permitir acceso por defecto
    return true;
  }
}
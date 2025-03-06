import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrowserRedirectGuard implements CanActivate {
  
  constructor(private router: Router) {}
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Detectar si es un navegador de escritorio
    const isDesktopBrowser = this.isDesktopBrowser();
    
    // Rutas permitidas para navegadores de escritorio
    const desktopRoutes = ['/desktop', '/home-desktop', '/call-center'];
    
    // Obtener el primer segmento de la ruta actual
    const currentRoute = '/' + state.url.split('/')[1];
    
    if (isDesktopBrowser) {
      // Si es un navegador de escritorio y trata de acceder a una ruta no permitida
      if (!desktopRoutes.some(route => currentRoute.startsWith(route))) {
        // Redirigir a desktop
        this.router.navigate(['/desktop']);
        return false;
      }
      return true;
    } else {
      // Si es un dispositivo móvil y trata de acceder a una ruta de escritorio
      if (desktopRoutes.some(route => currentRoute.startsWith(route))) {
        // Redirigir a la ruta principal para móviles
        this.router.navigate(['/auth/login']);
        return false;
      }
      
      // Si es la ruta raíz en móvil, redirigir al login
      if (state.url === '/') {
        this.router.navigate(['/auth/login']);
        return false;
      }
      
      return true;
    }
  }
  
  private isDesktopBrowser(): boolean {
    // Verificar si está ejecutándose en un navegador (no en Ionic/Cordova)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Si no es un dispositivo móvil, consideramos que es un navegador de escritorio
    return !isMobile;
  }
}
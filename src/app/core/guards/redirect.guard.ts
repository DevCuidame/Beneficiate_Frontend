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
    
    const url = state.url;
    
    if (url.includes('reset-password') || url.includes('new-password')) {
      return true;
    }
    
    const isDesktopBrowser = this.isDesktopBrowser();
    
    const desktopRoutes = ['/desktop', '/home-desktop', '/call-center'];
    
    const currentRoute = '/' + url.split('/')[1];
    
    if (isDesktopBrowser) {
      if (!desktopRoutes.some(route => currentRoute.startsWith(route))) {
        // Redirigir a desktop
        this.router.navigate(['/desktop']);
        return false;
      }
      return true;
    } else {
      if (desktopRoutes.some(route => currentRoute.startsWith(route))) {
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
  
  private isDesktopBrowser(): boolean {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return !isMobile;
  }
}
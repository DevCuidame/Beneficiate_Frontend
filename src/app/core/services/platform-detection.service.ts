// src/app/core/services/platform-detection.service.ts
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PlatformDetectionService {

  constructor(private platform: Platform) {}

  /**
   * Detecta si es un navegador de escritorio
   */
  isDesktopBrowser(): boolean {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return !isMobile;
  }

  /**
   * Detecta si es un navegador móvil (no app nativa)
   */
  isMobileBrowser(): boolean {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile && !this.isNativeApp();
  }

  /**
   * Detecta si es una aplicación nativa (Capacitor/Cordova)
   */
  isNativeApp(): boolean {
    return this.platform.is('capacitor') || this.platform.is('cordova');
  }

  /**
   * Obtiene la ruta de inicio de sesión adecuada basada en la plataforma
   */
  getLoginRoute(): string {
    if (this.isDesktopBrowser()) {
      return '/desktop/login';
    } else {
      return '/auth/login';
    }
  }

  /**
   * Obtiene la ruta de inicio adecuada basada en la plataforma
   */
  getHomeRoute(): string {
    if (this.isDesktopBrowser()) {
      return '/home-desktop';
    } else {
      return '/home/dashboard';
    }
  }
}
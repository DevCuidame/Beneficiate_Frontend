import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AutoRedirectGuard } from './core/guards/auth.guard';
import { BrowserRedirectGuard } from './core/guards/redirect.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [BrowserRedirectGuard],
    children: []
  },


  {
    path: 'desktop',
    loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule)
  },
  {
    path: 'home-desktop',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
    canActivate: [AutoRedirectGuard]
  },
  {
    path: 'call-center',
    loadChildren: () => import('./modules/callCenter/call-center.module').then(m => m.CallCenterModule),
  },
  { path: 'home', loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule) },
  { path: 'beneficiary', loadChildren: () => import('./modules/beneficiary/beneficiary.module').then(m => m.BeneficiaryModule) },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}


/**
 *
 * import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AutoRedirectGuard } from './core/guards/auth.guard';
import { BrowserRedirectGuard } from './core/guards/redirect.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [BrowserRedirectGuard],
    children: []
  },

  // Rutas de escritorio
  {
    path: 'desktop',
    loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule),
    canActivate: [BrowserRedirectGuard]
  },
  {
    path: 'home-desktop',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
    canActivate: [BrowserRedirectGuard]
  },
  {
    path: 'call-center',
    loadChildren: () => import('./modules/callCenter/call-center.module').then(m => m.CallCenterModule),
    canActivate: [BrowserRedirectGuard]
  },

  // Rutas de móvil
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
    canActivate: [AutoRedirectGuard, BrowserRedirectGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
    canActivate: [BrowserRedirectGuard]
  },
  {
    path: 'beneficiary',
    loadChildren: () => import('./modules/beneficiary/beneficiary.module').then(m => m.BeneficiaryModule),
    canActivate: [BrowserRedirectGuard]
  },

  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
 */

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
    path: 'reset-password',
    loadChildren: () => import('./modules/auth/pages/new-password/new-password.module').then(m => m.NewPasswordModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'call-center',
    loadChildren: () => import('./modules/callCenter/call-center.module').then(m => m.CallCenterModule),
  },
  { 
    path: 'home', 
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule) 
  },
  { 
    path: 'beneficiary', 
    loadChildren: () => import('./modules/beneficiary/beneficiary.module').then(m => m.BeneficiaryModule) 
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
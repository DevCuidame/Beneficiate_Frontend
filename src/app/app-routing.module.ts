import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AutoRedirectGuard } from './core/guards/auth.guard';
import { WelcomePageComponent } from './pages/welcome-page/welcome-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { NosotrosPageComponent } from './pages/nosotros-page/nosotros-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'welcome', component: WelcomePageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'nosotros', component: NosotrosPageComponent },
  { path: 'home-desktop', component: HomePageComponent },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
    canActivate: [AutoRedirectGuard] // Protegemos la ruta de login
  },
<<<<<<< HEAD
  {
    path: 'home',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'beneficiary',
    loadChildren: () => import('./modules/beneficiary/beneficiary.module').then(m => m.BeneficiaryModule)
  },
  { path: '**', redirectTo: 'auth/login' } // Si una ruta no existe, redirige al login
=======
  { path: 'home', loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule) },
  { path: 'beneficiary', loadChildren: () => import('./modules/beneficiary/beneficiary.module').then(m => m.BeneficiaryModule) },
  { path: '**', redirectTo: 'auth/login' } // Si una ruta no existe, regresa al login
>>>>>>> 8262ad00b1288fc22beaa1f14c0b33bc40c97034
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}

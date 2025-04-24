import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { AutoRedirectGuard } from 'src/app/core/guards/auth.guard';

import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { NosotrosPageComponent } from './nosotros-page/nosotros-page.component';
import { InitialPageComponent } from './work-with-us/intial-page/initial-page.component';
import { WorkFormComponent } from './work-with-us/work-form/work-form.component';



const routes: Routes = [
  {
    path: '',
    component: WelcomePageComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AutoRedirectGuard],
    data: { redirectTo: '/home-desktop' },
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
  },
  {
    path: 'about-us',
    component: NosotrosPageComponent,
  },
  {
    path: 'work-with-us',
    component: InitialPageComponent,
  },
  {
    path: 'work-with-us/form',
    component: WorkFormComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '**',
    redirectTo: '/'
  }
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
})
export class WelcomeModule { }

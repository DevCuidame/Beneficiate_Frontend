import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { HomePageComponent } from './home-page/home-page.component';
import { BeneficiaryInfoComponent } from './beneficiary-info/beneficiary-info.component';
import { ScheduleComponent } from './schedule-page/schedule.component';
import { UserProfileEditComponent } from '../user/user-profile-edit/user-profile-edit/user-profile-edit.component';
import { UserHealthInfoComponent } from 'src/app/modules/user/pages/user-health-info/user-health-info.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'beneficiary-info',
    component: BeneficiaryInfoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'schedule',
    component: ScheduleComponent,
  },
  {
    path: 'add',
    loadComponent: () => import('./new-beneficiary-form/new-beneficiary-form.component').then(m => m.NewBeneficiaryFormComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'user/edit',
    component: UserProfileEditComponent,
  },
  {
    path: 'user/health',
    component: UserHealthInfoComponent,
  },

  {
    path: '**',
    redirectTo: 'home-desktop'
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
export class HomeModule { }

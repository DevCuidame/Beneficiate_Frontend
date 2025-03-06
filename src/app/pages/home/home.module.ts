import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { NewBeneficiaryFormComponent } from './new-beneficiary-form/new-beneficiary-form.component';
import { HomePageComponent } from './home-page/home-page.component';
import { BeneficiaryInfoComponent } from './beneficiary-info/beneficiary-info.component';
import { ScheduleComponent } from './schedule-page/schedule.component';

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
    component: NewBeneficiaryFormComponent,
    canActivate: [AuthGuard],
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

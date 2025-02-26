import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { NewBeneficiaryFormComponent } from './new-beneficiary-form/new-beneficiary-form.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home-desktop',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: NewBeneficiaryFormComponent,
    canActivate: [AuthGuard], 
  },
  /*
  {
    path: 'home',
    component: HomeBeneficiaryComponent,
    canActivate: [AuthGuard],
  },
  */
  {
    path: '**',
    redirectTo: 'dashboard'
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

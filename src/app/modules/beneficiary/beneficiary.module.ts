import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { AddBeneficiaryComponent } from './add-beneficiary/add-beneficiary.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { HomeBeneficiaryComponent } from './home-beneficiary/home-beneficiary.component';
import { BeneficiaryHeaderComponent } from 'src/app/shared/components/beneficiary-header/beneficiary-header.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: AddBeneficiaryComponent,
    canActivate: [AuthGuard], 
  },
  {
    path: 'home',
    component: HomeBeneficiaryComponent,
    canActivate: [AuthGuard],
  },
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
    TabBarComponent,
    BeneficiaryHeaderComponent
  ],
})
export class BeneficiaryModule { }

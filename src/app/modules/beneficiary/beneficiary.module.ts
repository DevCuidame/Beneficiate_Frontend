import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { AddBeneficiaryComponent } from './add-beneficiary/add-beneficiary.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: AddBeneficiaryComponent,
    canActivate: [AuthGuard], // 👈 Protegemos la ruta con el guard
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
    TabBarComponent
  ],
})
export class BeneficiaryModule { }

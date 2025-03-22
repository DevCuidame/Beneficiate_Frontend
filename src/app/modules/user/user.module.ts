import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { UserHomeComponent } from './app/pages/user-home/user-home.component';
import { UserConditionsListComponent } from './app/components/user-conditions-list/user-conditions-list.component';
import { UserMedicalHistoryListComponent } from './app/components/user-medical-history-list/user-medical-history-list.component';
import { UserMedicationsAllergiesListComponent } from './app/components/user-medications-allergies-list/user-medications-allergies-list.component';
import { UserVaccinationsListComponent } from './app/components/user-vaccinations-list/user-vaccinations-list.component';
import { UserFormComponent } from './app/pages/user-form/user-form.component';
import { UserMedicalHistoryFormComponent } from './app/components/user-medical-history-form/user-medical-history-form.component';
import { UserMedicationsAllergiesFormComponent } from './app/components/user-medications-allergies-form/user-medications-allergies-form.component';
import { VacinationsFormComponent } from '../beneficiary/components/health/vacinations/vacinations-form/vacinations-form.component';
import { UserHealthConditionFormComponent } from './app/components/user-health-condition-form/user-health-condition-form.component';
import { UserVaccinationsFormComponent } from './app/components/user-vaccinations-form/user-vaccinations-form.component';

// Import page components

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: UserHomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'conditions',
        component: UserConditionsListComponent
      },
      {
        path: 'medical-history',
        component: UserMedicalHistoryListComponent
      },
      {
        path: 'medicaments-allergies',
        component: UserMedicationsAllergiesListComponent
      },
      {
        path: 'vaccinations',
        component: UserVaccinationsListComponent
      },

      
      // **Rutas para los formularios**
      { path: 'conditions/form', component: UserHealthConditionFormComponent},

      { path: 'medical-history/form', component: UserMedicalHistoryFormComponent },

      { path: 'medicaments-allergies/form', component: UserMedicationsAllergiesFormComponent },

      { path: 'vaccinations/form', component: UserVaccinationsFormComponent },

      {
        path: '**',
        redirectTo: 'home', 
      }

    ]
  },
  {
    path: 'form',
    component: UserFormComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class UserModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { UserHealthInfoComponent } from 'src/app/modules/user/user-health-info/user-health-info.component';
import { UserProfileEditComponent } from './user-profile-edit/user-profile-edit/user-profile-edit.component';

// Importar los componentes standalone

const routes: Routes = [
  {
    path: 'edit',
    component: UserProfileEditComponent,
  },
  {
    path: 'health',
    component: UserHealthInfoComponent,
  },
  {
    path: '**',
    redirectTo: ''
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
export class UserModule { }
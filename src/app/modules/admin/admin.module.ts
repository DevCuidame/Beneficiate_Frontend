import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// Components
import { DashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { PlanDashboardComponent } from './components/plan-dashboard/plan-dashboard.component';
import { AppLayoutComponent } from 'src/app/layout/app.layout.component';

const routes: Routes = [
  {
    path: 'home',
    component: AppLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'plans', component: PlanDashboardComponent },
    ]
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  declarations: [
    // Si UsersTablesComponent no es standalone, decláralo aquí
    // UsersTablesComponent
  ],
  imports: [
    CommonModule,
    FormsModule, // Necesario para [(ngModel)]
    RouterModule.forChild(routes),
    IonicModule,

    
    // Components
    AppLayoutComponent,
    DashboardComponent,
    PlanDashboardComponent
  ],
})
export class AdminModule { }
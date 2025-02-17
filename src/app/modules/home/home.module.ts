import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { ServicesListComponent } from './pages/services-list/services-list.component';
import { ServiceCardComponent } from 'src/app/shared/components/service-card/service-card.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard], 
  },

  {
    path: 'services',
    component: ServicesListComponent,
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
    ServiceCardComponent
  ],
})
export class HomeModule {}

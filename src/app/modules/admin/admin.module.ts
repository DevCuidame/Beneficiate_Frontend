import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// PrimeNG Modules para el dashboard
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

// Components
import { DashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AppLayoutComponent } from 'src/app/layout/app.layout.component';

const routes: Routes = [
  {
    path: 'home',
    component: AppLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
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
    
    // PrimeNG modules
    TableModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    AvatarModule,
    AvatarGroupModule,
    ButtonModule,
    RippleModule,
    
    // Components (si son standalone)
    AppLayoutComponent,
    DashboardComponent
  ],
})
export class AdminModule { }
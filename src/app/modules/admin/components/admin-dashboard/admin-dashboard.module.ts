import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

// Component
import { DashboardComponent } from './admin-dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    
    TableModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    AvatarModule,
    AvatarGroupModule,
    ButtonModule,
    RippleModule
  ],
  exports: [
    DashboardComponent
  ]
})
export class DashboardModule { }
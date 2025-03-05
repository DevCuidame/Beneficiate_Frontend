import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ContainterDashComponent } from './components/containter-dash/containter-dash.component';
import { AppointmentAssignmentComponent } from 'src/app/pages/callCenter/appointment-assignment/appointment-assignment.component';
import { DailyAppointmentsComponent } from 'src/app/pages/callCenter/daily-appointments/daily-appointments.component';
import { PendingAppointmentsComponent } from 'src/app/pages/callCenter/pending-appointments/pending-appointments.component';


const routes: Routes = [
  {
    path: 'dash',
    component: ContainterDashComponent,
    children: [
      { path: 'assigment', component: AppointmentAssignmentComponent },
      { path: 'pending', component: PendingAppointmentsComponent },
      { path: 'daily', component: DailyAppointmentsComponent },
      { path: '', redirectTo: 'assigment', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'call-center', pathMatch: 'full' },
  { path: '**', redirectTo: 'call-center' }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), IonicModule],
})
export class CallCenterModule {}

import { Component, OnInit } from '@angular/core';
import { AppointmentWizardComponent } from 'src/app/shared/components/call-center/appointment-wizard/appointment-wizard.component';

@Component({
  selector: 'app-pending-appointments',
  imports: [AppointmentWizardComponent],
  templateUrl: './pending-appointments.component.html',
  styleUrls: ['./pending-appointments.component.scss'],
})
export class PendingAppointmentsComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faCrown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-appointment-assigned',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './appointment-assigned.component.html',
  styleUrls: ['./appointment-assigned.component.scss'],
})
export class AppointmentAssignedComponent {
  @Input() public isPending: boolean = false;
  @Input() public patientName: string = '';
  @Input() public professionalName: string = '';
  @Input() public specialty: string = '';
  @Input() public date: string = '';
  @Input() public time: string = '';
  @Input() public dayOfWeek: string = '';

  public faCheckCircle = faCheckCircle;
  public faCrown = faCrown;
}

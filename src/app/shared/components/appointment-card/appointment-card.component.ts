import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PrimaryCardComponent } from '../primary-card/primary-card.component';

@Component({
  selector: 'app-appointment-card',
  standalone: true,
  imports: [CommonModule, IonicModule, PrimaryCardComponent],
  templateUrl: './appointment-card.component.html',
  styleUrls: ['./appointment-card.component.scss'],
})
export class AppointmentCardComponent implements OnInit {
  @Input() patientName: string = 'Nombre del Paciente';
  @Input() last_name: string = 'Nombre del Profesional';
  @Input() first_name: string = 'Nombre del Profesional';
  @Input() specialty: string = 'Especialidad';
  @Input() doctorName: string = 'Nombre del Doctor';
  @Input() date: string = 'Fecha de la cita';
  @Input() time: string = 'Hora de la cita';
  @Input() dayOfWeek: string = 'Día de la semana';

  public edit_button: boolean = false;

  constructor() {}

  ngOnInit() {}

  edit() {
    this.edit_button = !this.edit_button;
  }
}

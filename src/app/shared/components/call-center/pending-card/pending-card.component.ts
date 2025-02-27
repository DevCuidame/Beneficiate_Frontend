import { environment } from './../../../../../environments/environment';
import { Component, Input, OnInit } from '@angular/core';
import { CustomButtonComponent } from '../../custom-button/custom-button.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { Appointment } from 'src/app/core/interfaces/appointment.interface'; 

@Component({
  selector: 'app-pending-card',
  imports: [CustomButtonComponent, CommonModule, FontAwesomeModule],
  templateUrl: './pending-card.component.html',
  styleUrls: ['./pending-card.component.scss'],
})
export class PendingCardComponent implements OnInit {
  @Input() color: string = '';
  @Input() appointment!: Appointment; 
  public environment = environment.url;

  public buttonBackground: string = 'assets/background/primary_button_bg.svg';
  public faClock = faClock;

  constructor() {}

  ngOnInit() {}

  getClockColor(appointment: Appointment): string {
    const createdAt = new Date(appointment.created_at).getTime();
    const expirationTime = createdAt + 2 * 60 * 60 * 1000; // 2 horas
    const now = Date.now();
  
    if (now >= expirationTime) {
      return 'var(--ion-color-danger)'; // Rojo
    }
    const remaining = expirationTime - now;
    if (remaining <= 30 * 60 * 1000) { // 30 minutos o menos
      return 'var(--ion-color-secondary)'; // Naranja
    }
    return 'var(--ion-color-primary)'; // Verde
  }
  
  

}

import { environment } from './../../../../../environments/environment';
import { Component, Input, OnInit } from '@angular/core';
import { CustomButtonComponent } from '../../custom-button/custom-button.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { Appointment } from 'src/app/core/interfaces/appointment.interface';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit() {}

  getClockColor(appointment: Appointment): string {
    const createdAt = new Date(appointment.created_at).getTime();
    const expirationTime = createdAt + 2 * 60 * 60 * 1000;
    const now = Date.now();

    if (now >= expirationTime) {
      return 'var(--ion-color-danger)';
    }
    const remaining = expirationTime - now;
    if (remaining <= 30 * 60 * 1000) {
      return 'var(--ion-color-secondary)';
    }
    return 'var(--ion-color-primary)';
  }

  goToAppointment(appointment: Appointment) {
    if (!appointment) {
      console.error('Error: appointment no está definido.');
      return;
    }

    localStorage.setItem('selectedAppointment', JSON.stringify(appointment));
    this.router.navigate(['/call-center/dash/pending'], {
      state: { appointment },
    });
  }
}

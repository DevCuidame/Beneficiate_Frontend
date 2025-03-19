import { environment } from './../../../../../environments/environment';
import { Component, Input, OnInit } from '@angular/core';
import { CustomButtonComponent } from '../../custom-button/custom-button.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock, faCalendar } from '@fortawesome/free-regular-svg-icons';
import { Appointment } from 'src/app/core/interfaces/appointment.interface';
import { Router } from '@angular/router';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { AlertController } from '@ionic/angular';

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
  public confirmButtonBackground: string = 'assets/background/confirm_button_bg.svg';
  public faClock = faClock;
  public faCalendar = faCalendar;

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private toastService: ToastService,
    private alertController: AlertController
  ) {}

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

  // Verifica si la cita necesita asignación de horario
  needsScheduleAssignment(): boolean {
    return !this.appointment.appointment_date || !this.appointment.appointment_time;
  }

  // Formatea la fecha para mostrarse de manera amigable
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateStr;
    }
  }

  // Navega a la página de asignación de cita
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

  // Navega a la página de asignación de horario para citas pendientes por confirmar
  assignSchedule(appointment: Appointment) {
    if (!appointment) {
      console.error('Error: appointment no está definido.');
      return;
    }

    // Podemos usar la misma ruta pero con un query param para indicar que es asignación de horario
    localStorage.setItem('selectedAppointment', JSON.stringify(appointment));
    this.router.navigate(['/call-center/dash/pending'], {
      state: { 
        appointment,
        scheduleAssignment: true // Flag para indicar que es asignación de horario
      },
    });
  }

  // Confirma una cita que ya tiene fecha y hora asignadas
  async confirmAppointment(appointment: Appointment) {
    const alert = await this.alertController.create({
      header: 'Confirmar cita',
      message: `¿Está seguro que desea confirmar la cita para ${this.formatDate(appointment.appointment_date)} a las ${appointment.appointment_time}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            // Actualizar estado de la cita
            const updatedAppointment = {
              ...appointment,
              status: 'CONFIRMED'
            };
            
            this.appointmentService.updateAppointment(appointment.id, updatedAppointment as Appointment)
              .subscribe({
                next: (response) => {
                  if (response && response.statusCode === 200) {
                    this.toastService.presentToast('Cita confirmada exitosamente', 'success');
                    // Emitir evento o recargar datos
                  } else {
                    this.toastService.presentToast('Error al confirmar la cita', 'danger');
                  }
                },
                error: (error) => {
                  console.error('Error al confirmar cita:', error);
                  this.toastService.presentToast('Error al confirmar la cita', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }
}
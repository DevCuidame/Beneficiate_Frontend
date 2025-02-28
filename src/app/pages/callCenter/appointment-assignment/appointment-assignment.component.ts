import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PendingCardComponent } from 'src/app/shared/components/call-center/pending-card/pending-card.component';
import { SearchBarComponent } from 'src/app/shared/components/call-center/search-bar/search-bar.component';
import { WebsocketService } from 'src/app/core/services/websocket.service';
import {
  Appointment,
  appointmentCounts,
} from 'src/app/core/interfaces/appointment.interface';

@Component({
  selector: 'app-appointment-assignment',
  imports: [PendingCardComponent, FontAwesomeModule, SearchBarComponent],
  templateUrl: './appointment-assignment.component.html',
  styleUrls: ['./appointment-assignment.component.scss'],
})
export class AppointmentAssignmentComponent implements OnInit, OnDestroy {
  public appointments: Appointment[] = [];
  public appointmentCounts: appointmentCounts = {
    EXPIRED: 0,
    PENDING: 0,
    CONFIRMED: 0,
    CANCELLED: 0,
    RESCHEDULED: 0,
  };
  public requests: string =
    this.appointmentCounts.PENDING > 0
      ? `${this.appointmentCounts.PENDING} solicitudes`
      : '0 solicitudes';

  private wsSubscription!: Subscription;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.wsSubscription = this.websocketService.connect().subscribe({
      next: (data) => {
        console.log('Datos recibidos desde WebSocket:', data);
        if (data.event === 'all_appointments' && data.appointments) {
          this.appointments = data.appointments.data as Appointment[];
          this.appointmentCounts = data.appointments.counts;
          console.log('Citas actualizadas:', this.appointments);
          console.log('Contadores:', this.appointmentCounts);
        } else if (data.event === 'new_appointment' && data.appointment) {
          this.appointments.push(data.appointment as Appointment);
          console.log('Nueva cita agregada:', data.appointment);
        }
      },
      error: (error) => {
        console.error('Error en WebSocket:', error);
      },
      complete: () => {
        console.log('Conexión WebSocket cerrada');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }
  
}

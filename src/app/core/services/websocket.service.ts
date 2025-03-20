import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';
import { environment } from 'src/environments/environment';
import { AppointmentService } from './appointment.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private ws!: WebSocket;
  private userAppointments = new BehaviorSubject<Appointment[]>([]);
  public userAppointments$ = this.userAppointments.asObservable();

  constructor(private appointmentService: AppointmentService) {}

  public connect(professionalId?: number): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token en local storage');
    }

    const wsUrl = environment.url.replace(/^http/, 'ws').replace(/\/$/, '');

    this.ws = new WebSocket(wsUrl, ['tokenAuth', token]);

    return new Observable((observer: Observer<any>) => {
      this.ws.onopen = () => {
        if (professionalId) {
          this.ws.send(
            JSON.stringify({
              event: 'chatbot_init',
              professionalId,
            })
          );
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (
            data.event === 'user_appointments' &&
            Array.isArray(data.appointments)
          ) {
            this.userAppointments.next(data.appointments);
            this.appointmentService.updateAppointments(data.appointments);
            observer.next(data);
          } else if (data.event === 'all_appointments') {
            this.userAppointments.next(data.appointments);
            observer.next(data);
          } else if (
            data.event === 'chatbot_message' ||
            data.event === 'new_appointment'
          ) {
            observer.next(data);
          }
        } catch (error) {
          console.error('Error procesando mensaje WebSocket:', error);
          observer.error(error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket del chatbot:', error);
        observer.error(error);
      };

      this.ws.onclose = () => {
        observer.complete();
      };

      return () => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.close();
        }
      };
    });
  }

  public send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const chatbotData = {
        ...data,
        source: 'chatbot',
      };

      this.ws.send(JSON.stringify(chatbotData));
    } else {
      console.error('WebSocket del chatbot no está conectado.');
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}

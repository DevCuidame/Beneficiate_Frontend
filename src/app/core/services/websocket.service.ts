import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws!: WebSocket;
  private userAppointments = new BehaviorSubject<Appointment[]>([]);
  public userAppointments$ = this.userAppointments.asObservable();

  // Ahora se acepta un parámetro opcional professionalId
  public connect(professionalId?: number): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token en local storage');
    }
    
    const wsUrl = 'ws://localhost:3000';
    this.ws = new WebSocket(wsUrl, token);

    return new Observable((observer: Observer<any>) => {
      this.ws.onopen = () => {
        console.log('Conexión WebSocket establecida');
        // Envía el mensaje init desde onopen para garantizar que la conexión esté lista.
        if (professionalId) {
          console.log('Enviando init desde onopen con professionalId:', professionalId);
          this.ws.send(JSON.stringify({ event: 'init', professionalId }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'user_appointments') {
            console.log("📢 Citas recibidas:", data.appointments);
            this.userAppointments.next(data.appointments);
          }
          observer.next(data);
        } catch (error) {
          observer.error(error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        observer.error(error);
      };

      this.ws.onclose = () => {
        console.log('Conexión WebSocket cerrada');
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
      this.ws.send(JSON.stringify(data));
      console.log("🚀 ~ WebsocketService ~ send ~ data:", data);
    } else {
      console.error('WebSocket no está conectado.');
    }
  }

  public notifyTyping(chat_id: string, user_id: string): void {
    this.send({ event: 'typing', chat_id, user_id });
  }

  public notifyStopTyping(chat_id: string, user_id: string): void {
    this.send({ event: 'stop_typing', chat_id, user_id });
  }

  public markMessageAsRead(chat_id: string, user_id: string, message_id: string): void {
    this.send({ event: 'message_read', chat_id, user_id, message_id });
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}

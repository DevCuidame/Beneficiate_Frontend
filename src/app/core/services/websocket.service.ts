import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws!: WebSocket;
  private userAppointments = new BehaviorSubject<Appointment[]>([]);
  public userAppointments$ = this.userAppointments.asObservable();

  public connect(professionalId?: number): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token en local storage');
    }
    
    const baseUrl = environment.url.replace(/^http/, 'ws').replace(/\/$/, '');
    const wsUrl = `${baseUrl}/ws`; 
    
    this.ws = new WebSocket(wsUrl, ['tokenAuth', token]);

    return new Observable((observer: Observer<any>) => {
      this.ws.onopen = () => {
        console.log('Conexión WebSocket del chatbot establecida');
        if (professionalId) {
          console.log('Enviando init desde onopen con professionalId:', professionalId);
          this.ws.send(JSON.stringify({ 
            event: 'chatbot_init', 
            professionalId 
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.event === 'all_appointments') {
            console.log("📢 Citas recibidas:", data.appointments);
            this.userAppointments.next(data.appointments);
            observer.next(data);
          }
          
          if (data.event === 'chatbot_message' || 
              data.event === 'new_appointment') {
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
        console.log('Conexión WebSocket del chatbot cerrada');
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
        source: 'chatbot' 
      };
      
      this.ws.send(JSON.stringify(chatbotData));
      console.log("🚀 ~ WebsocketService ~ send ~ chatbotData:", chatbotData);
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
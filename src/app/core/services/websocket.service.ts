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

  // Ahora se acepta un parámetro opcional professionalId
  public connect(professionalId?: number): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token en local storage');
    }
    
    // Asegurarse de que la URL tenga el formato correcto para WebSocket
    const baseUrl = environment.url.replace(/^http/, 'ws').replace(/\/$/, '');
    const wsUrl = `${baseUrl}/ws`; // Asegúrate de que coincida con la ruta de tu servidor WebSocket
    
    // Usar el mismo formato para los protocolos que usa ChatWebsocketService
    this.ws = new WebSocket(wsUrl, ['tokenAuth', token]);

    return new Observable((observer: Observer<any>) => {
      this.ws.onopen = () => {
        console.log('Conexión WebSocket del chatbot establecida');
        // Envía el mensaje init desde onopen para garantizar que la conexión esté lista.
        if (professionalId) {
          console.log('Enviando init desde onopen con professionalId:', professionalId);
          this.ws.send(JSON.stringify({ 
            event: 'chatbot_init', // Usar un nombre de evento específico para el chatbot
            professionalId 
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          console.log('Mensaje recibido en WebsocketService (chatbot):', event.data);
          const data = JSON.parse(event.data);
          
          // Solo procesar eventos específicos del chatbot o de citas
          if (data.event === 'user_appointments') {
            console.log("📢 Citas recibidas:", data.appointments);
            this.userAppointments.next(data.appointments);
          }
          
          // También pasar eventos de chatbot al componente
          if (data.event === 'chatbot_message' || 
              data.event === 'user_appointments' ||
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
      // Añadir un tipo para identificar que es un mensaje del chatbot
      const chatbotData = { 
        ...data, 
        source: 'chatbot' // Añadir un campo para identificar la fuente
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
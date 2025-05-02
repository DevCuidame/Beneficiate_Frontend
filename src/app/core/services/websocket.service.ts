import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Observer, throwError } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';
import { environment } from 'src/environments/environment';
import { AppointmentService } from './appointment.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private ws!: WebSocket;
  private userAppointments = new BehaviorSubject<Appointment[]>([]);
  public userAppointments$ = this.userAppointments.asObservable();

  // Variables para manejar reconexión
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 2000; // 2 segundos
  private connecting = false;
  private messageQueue: any[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private toastService: ToastService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  public connect(professionalId?: number): Observable<any> {
    // Si ya estamos en proceso de conexión, no iniciar otra
    if (this.connecting) {
      return new Observable((observer: Observer<any>) => {
        const checkConnection = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            this.attachObserverToWebSocket(observer, professionalId);
          }
        }, 100);

        // Limpiar el intervalo si no hay conexión después de un tiempo
        setTimeout(() => {
          clearInterval(checkConnection);
          observer.error(new Error('Tiempo de espera de conexión agotado'));
        }, 10000);
      });
    }

    this.connecting = true;
    const token = localStorage.getItem('token');
    if (!token) {
      this.connecting = false;
      return throwError(
        () => new Error('No se encontró token en local storage')
      );
    }

    const user = this.userService.getUser();
    if (!user?.plan) {
      this.connecting = false;
      this.toastService.presentToast(
        'Necesitas tener un plan activo para acceder a esta funcionalidad',
        'warning'
      );
      this.authService.logout();
      return throwError(() => new Error('Usuario sin plan activo'));
    }

    // Asegurarse de que la URL de WebSocket esté correctamente formateada
    let wsUrl = environment.url.replace(/^http/, 'ws').replace(/\/$/, '');

    return new Observable((observer: Observer<any>) => {
      try {
        this.ws = new WebSocket(wsUrl, ['tokenAuth', token]);

        this.ws.onerror = (error) => {
          console.error('Error directo en WebSocket:', error);
          this.connecting = false;

          // Intentar reconectar automáticamente
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.toastService.presentToast(
              `Intentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
              'warning'
            );

            setTimeout(() => {
              // Crear una nueva conexión y vincularla con el observador original
              this.connect(professionalId).subscribe({
                next: (data) => observer.next(data),
                error: (err) => observer.error(err),
                complete: () => observer.complete(),
              });
            }, this.reconnectDelay);
          } else {
            this.toastService.presentToast(
              'No se pudo establecer conexión después de varios intentos',
              'danger'
            );
            observer.error(error);
          }
        };

        this.attachObserverToWebSocket(observer, professionalId);
      } catch (error) {
        console.error('Error al crear WebSocket:', error);
        this.connecting = false;
        observer.error(error);
      }
    });
  }

  public resetConnection(professionalId?: number): Observable<any> {
    this.disconnect();

    return new Observable((observer) => {
      setTimeout(() => {
        this.connect(professionalId).subscribe({
          next: (data) => observer.next(data),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      }, 500);
    });
  }

  private attachObserverToWebSocket(
    observer: Observer<any>,
    professionalId?: number
  ): void {
    this.ws.onopen = () => {
      this.connecting = false;
      this.reconnectAttempts = 0;

      // Enviar mensaje inicial si hay un ID de profesional
      if (professionalId) {
        try {
          this.ws.send(
            JSON.stringify({
              event: 'chatbot_init',
              professionalId,
            })
          );
        } catch (error) {
          console.error('Error al enviar mensaje inicial:', error);
        }
      }

      // Enviar mensajes en cola
      while (this.messageQueue.length > 0) {
        const queuedMessage = this.messageQueue.shift();
        this.send(queuedMessage);
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
          // Para mensajes del chatbot, procesar las opciones seleccionables
          if (data.event === 'chatbot_message') {
            // Asegurarse de que tenemos las propiedades list y options correctamente
            if (data.list === true && !data.options) {
              data.options = [];
            }
          }

          observer.next(data);
        } else if (data.error) {
          // Manejar explícitamente los mensajes de error
          console.error('Error desde el servidor WebSocket:', data.error);
          observer.error(new Error(data.error));
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

    this.ws.onclose = (event) => {
      // Solo reconectar si no es un cierre limpio (código 1000)
      if (
        event.code !== 1000 &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;
        // this.toastService.presentToast(
        //   `Reconectando (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
        //   'warning'
        // );

        setTimeout(() => {
          // Crear una nueva conexión y vincularla con el observador original
          this.connect(professionalId).subscribe({
            next: (data) => observer.next(data),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
        }, this.reconnectDelay);
      } else {
        observer.complete();
      }
    };
  }

  public send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Formatear los datos según el tipo de mensaje
      const chatbotData = {
        ...data,
        source: 'chatbot',
      };

      try {
        this.ws.send(JSON.stringify(chatbotData));
      } catch (error) {
        console.error('Error al enviar mensaje al servidor:', error);

        // Agregar a la cola si no se pudo enviar
        this.messageQueue.push(data);

        // Intentar reconectar si es un error de conexión
        if (this.ws.readyState !== WebSocket.OPEN && !this.connecting) {
          this.connect();
        }
      }
    } else {
      // Agregar mensaje a la cola para enviarlo cuando se conecte
      this.messageQueue.push(data);

      // Iniciar conexión si no está conectando o conectado
      if (
        !this.connecting &&
        (!this.ws || this.ws.readyState !== WebSocket.CONNECTING)
      ) {
        this.connect();
      }
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Cierre controlado');
    }

    // Reiniciar variables de reconexión
    this.reconnectAttempts = 0;
    this.connecting = false;
    this.messageQueue = [];
  }
}

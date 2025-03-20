// websocket.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatWebsocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<any>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  public connect(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl =  environment.url.replace(/^http/, 'ws').replace(/\/$/, '');

    this.socket = new WebSocket(wsUrl, ['tokenAuth', token]);

    this.socket.onopen = () => {
      this.connectionStatusSubject.next(true);
    };

    this.socket.binaryType = 'arraybuffer'; // Cambiar a arraybuffer para mejor manejo

    this.socket.onmessage = (event) => {
      try {
        if (event.data instanceof ArrayBuffer && event.data.byteLength === 0) {
          return;
        }

        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);

            if (
              data.event === 'new_message' &&
              data.message?.sender_type === 'AGENT'
            ) {
              data.event = 'agent_chat_message';
            } else if (
              data.event === 'new_message' &&
              data.message?.sender_type === 'USER'
            ) {
              data.event = 'user_message';
            }

            this.messagesSubject.next(data);
          } catch (jsonError) {
            console.warn(
              'Error al parsear mensaje de texto como JSON:',
              jsonError
            );
          }
          return;
        }

        if (
          (event.data instanceof ArrayBuffer && event.data.byteLength > 0) ||
          (event.data instanceof Blob && event.data.size > 0)
        ) {
          const reader = new FileReader();
          reader.onload = () => {
            const textContent = reader.result as string;

            if (!textContent || textContent.trim() === '') {
              return;
            }

            try {
              const jsonData = JSON.parse(textContent);
              this.messagesSubject.next(jsonData);
            } catch (jsonError) {
              console.warn(
                'Error al parsear contenido binario como JSON:',
                jsonError
              );
            }
          };

          reader.onerror = (readerError) => {
            console.error('Error al leer datos binarios:', readerError);
          };

          const dataToRead =
            event.data instanceof ArrayBuffer
              ? new Blob([event.data])
              : event.data;

          reader.readAsText(dataToRead);
        }
      } catch (error) {
        console.error('Error al procesar mensaje WebSocket:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
      this.connectionStatusSubject.next(false);
    };

    this.socket.onclose = (event) => {
      this.connectionStatusSubject.next(false);

      if (event.code !== 1000) {
        setTimeout(() => this.connect(), 3000);
      }
    };
  }

  public sendMessage(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        console.log('Sending WebSocket message:', data);
        const jsonString = JSON.stringify(data);
        this.socket.send(jsonString);
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
      }
    } else {
      console.error(
        'WebSocket no está conectado. Estado:',
        this.socket?.readyState
      );
      this.connect();
      setTimeout(() => {
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.sendMessage(data);
        }
      }, 1000);
    }
  }

  public getMessages(): Observable<any> {
    return this.messagesSubject.asObservable();
  }

  public getConnectionStatus(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Desconexión intencional');
    }
  }
}

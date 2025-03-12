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

    const baseUrl = environment.url.replace(/^http/, 'ws').replace(/\/$/, '');
    const wsUrl = `${baseUrl}/ws`;

    this.socket = new WebSocket(wsUrl, ['tokenAuth', token]);

    this.socket.onopen = () => {
      console.log('Conexión WebSocket establecida');
      this.connectionStatusSubject.next(true);
    };

    this.socket.binaryType = 'arraybuffer'; // Cambiar a arraybuffer para mejor manejo

    this.socket.onmessage = (event) => {
      try {
        // Log para depuración
        console.log('Mensaje recibido:', event);

        // Si recibimos un ArrayBuffer vacío, probablemente es un heartbeat o ping
        if (event.data instanceof ArrayBuffer && event.data.byteLength === 0) {
          console.log('Recibido heartbeat/ping (ArrayBuffer vacío)');
          return; // Ignoramos estos mensajes
        }

        // Si es un string, intentamos parsearlo como JSON
        // When successfully parsing JSON data, check if we need to normalize event types
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);

            // Ensure we normalize message events if needed
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

        // Si es un ArrayBuffer o Blob con contenido, intentamos convertirlo a texto
        if (
          (event.data instanceof ArrayBuffer && event.data.byteLength > 0) ||
          (event.data instanceof Blob && event.data.size > 0)
        ) {
          const reader = new FileReader();
          reader.onload = () => {
            const textContent = reader.result as string;

            // Si el contenido está vacío, no hacemos nada
            if (!textContent || textContent.trim() === '') {
              console.log('Contenido binario vacío');
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

          // Convertir ArrayBuffer a Blob si es necesario
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
      console.log('Conexión WebSocket cerrada:', event.code, event.reason);
      this.connectionStatusSubject.next(false);

      // Reconectar automáticamente, excepto si el cierre fue intencional (código 1000)
      if (event.code !== 1000) {
        console.log('Intentando reconexión en 3 segundos...');
        setTimeout(() => this.connect(), 3000);
      }
    };
  }

  public sendMessage(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        const jsonString = JSON.stringify(data);
        console.log('Enviando mensaje:', jsonString);
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

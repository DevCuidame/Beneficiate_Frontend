import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatWebsocketService {
  private ws!: WebSocket;

  /**
   * Conecta al servidor WebSocket, obteniendo el token del localStorage y enviándolo
   * como protocolo en el constructor de WebSocket.
   * @returns Observable que emite los mensajes recibidos.
   */
  public connect(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token en local storage');
    }
    // El token se envía como protocolo en el header 'sec-websocket-protocol'
    const wsUrl = 'ws://localhost:3000';
    this.ws = new WebSocket(wsUrl, token);

    return new Observable((observer: Observer<any>) => {
      this.ws.onopen = (event) => {
        console.log('Conexión WebSocket establecida', event);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          observer.next(data);
        } catch (error) {
          observer.error(error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        observer.error(error);
      };

      this.ws.onclose = (event) => {
        console.log('Conexión WebSocket cerrada', event);
        observer.complete();
      };

      // Función de limpieza: se cierra la conexión al desuscribirse
      return () => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.close();
        }
      };
    });
  }

  /**
   * Envía datos al servidor WebSocket.
   * @param data Objeto a enviar (se serializa a JSON).
   */
  public send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket no está conectado.');
    }
  }

  /**
   * Cierra la conexión del WebSocket de forma manual.
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}

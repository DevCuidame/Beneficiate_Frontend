import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws!: WebSocket;

  public connect(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token en local storage');
    }
    
    const wsUrl = 'ws://localhost:3000';
    this.ws = new WebSocket(wsUrl, token);

    return new Observable((observer: Observer<any>) => {
      this.ws.onopen = () => {
        console.log('Conexión WebSocket establecida');
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
      console.log("🚀 ~ ChatWebsocketService ~ send ~ data:", data)
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

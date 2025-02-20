import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { Chat } from '../interfaces/chat.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // URL base para la API de chat; ajusta según la ruta de tu servidor
  private baseUrl = environment.url + 'api/v1/chat';

  constructor(private http: HttpClient) {}

  createChat(chatData: any): Observable<Chat> {
    return this.http.post<Chat>(`${this.baseUrl}/create`, chatData);
  }

  sendMessage(messageData: any): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/send`, messageData);
  }

  fetchChatMessages(chatId: number | string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/messages/${chatId}`);
  }

  fetchUserChats(userId: number | string): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.baseUrl}/user/${userId}`);
  }

  closeChat(chatId: number | string): Observable<any> {
    return this.http.put(`${this.baseUrl}/close/${chatId}`, {});
  }

  reopenChat(chatId: number | string): Observable<any> {
    return this.http.put(`${this.baseUrl}/reopen/${chatId}`, {});
  }

  assignAgentToChat(assignData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/assign-agent`, assignData);
  }
}

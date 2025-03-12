// agent-chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatWebsocketService } from './chat-websocket.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgentChatService {
  private apiUrl = environment.url + 'api/v1/agent-chat';

  constructor(
    private http: HttpClient,
    private websocketService: ChatWebsocketService
  ) {}

  // Update HTTP methods to match backend routes
  getAgentChats(agentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/agent/${agentId}`);
  }

  getUserChats(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  getOnlineUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/online-users`);
  }

  getChatMessages(chatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${chatId}`);
  }

  initiateChat(userId: number): void {
    this.websocketService.sendMessage({
      event: 'initiate_chat',
      user_id: userId
    });
  }

  sendChatMessage(chatId: number, message: string): void {
    
    this.websocketService.sendMessage({
      event: 'agent_chat_message',
      chat_id: chatId,
      message: message
    });
  }

  closeChat(chatId: number, closedBy: number): void {
    this.websocketService.sendMessage({
      event: 'close_chat',
      chat_id: chatId,
      closed_by: closedBy
    });
  }
}
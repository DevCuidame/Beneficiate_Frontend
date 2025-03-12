import { UserService } from './../../../modules/auth/services/user.service';
import { AgentChatService } from './../../../core/services/agent-chat.service';
// agent-chat-panel.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatWebsocketService } from 'src/app/core/services/chat-websocket.service';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent-chat-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-chat-panel.component.html',
  styleUrls: ['./agent-chat-panel.component.scss'],
})
export class AgentChatPanelComponent implements OnInit, OnDestroy {
  showOnlineUsers = false;
  activeChats: any[] = [];
  onlineUsers: any[] = [];
  selectedChat: any = null;
  messages: any[] = [];
  newMessage = '';
  loading = false;
  error: string | null = null;
  private wsSubscription!: Subscription;

  constructor(
    private websocketService: ChatWebsocketService,
    private agentChatService: AgentChatService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.websocketService.connect();

    // Suscribirse a mensajes WebSocket
    this.wsSubscription = this.websocketService.getMessages().subscribe(
      (data) => this.handleWebSocketMessage(data),
      (error) => {
        console.error('Error en suscripción WebSocket:', error);
        this.error = 'Error de conexión';
      }
    );

    this.fetchActiveChats();
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  private handleWebSocketMessage(data: any): void {
    console.log('Mensaje WebSocket recibido en agente:', data);
  
    switch (data.event) {
      case 'agent_connected':
        console.log('Agente conectado:', data.agent);
        break;
  
      case 'agent_chats':
        this.activeChats = data.chats;
        this.loading = false;
        break;
  
      case 'online_users':
        this.onlineUsers = data.users;
        break;
  
      case 'new_message':
      case 'agent_chat_message':
      case 'user_message':
        if (!data.message) {
          console.error('Mensaje recibido sin propiedad message:', data);
          return;
        }
        
        const message = this.normalizeMessage(data.message, data.chat_id);
        
        const messageExists = data.message.id && 
                            this.messages.some(m => m.id === data.message.id);
                            
        const tempMessageExists = this.messages.some(m => 
            m.id.toString().startsWith('temp_') && 
            m.message === message.message && 
            m.sender_type === message.sender_type && 
            m.chat_id === message.chat_id);
        
        // Solo agregar el mensaje si no es un duplicado
        if (!messageExists && !tempMessageExists && 
            this.selectedChat && data.chat_id === this.selectedChat.id) {
          console.log('Agregando mensaje al chat seleccionado del agente:', message);
          this.messages.push(message);
          setTimeout(() => this.scrollToBottom(), 100);
        } else {
          console.log('Mensaje ignorado (duplicado o chat no seleccionado):', 
                     { messageExists, tempMessageExists, message });
        }
  
        // Actualizar el último mensaje en la lista de chats
        this.activeChats = this.activeChats.map(chat => 
          chat.id === data.chat_id ? 
          { ...chat, last_message: message.message } : 
          chat
        );
        break;
  
      case 'chat_initiated':
      case 'new_chat':
        // Un nuevo chat ha sido iniciado
        this.activeChats = [data.chat, ...this.activeChats];
        // Opcionalmente, seleccionar automáticamente el nuevo chat
        if (!this.selectedChat) {
          this.selectChat(data.chat);
        }
        break;
  
      case 'chat_closed':
        if (this.selectedChat && data.chat_id === this.selectedChat.id) {
          this.selectedChat = { ...this.selectedChat, status: 'CLOSED' };
          if (data.message) {
            const closeMessage = this.normalizeMessage(data.message, data.chat_id);
            this.messages.push(closeMessage);
            setTimeout(() => this.scrollToBottom(), 100);
          }
        }
  
        this.activeChats = this.activeChats.map(chat => 
          chat.id === data.chat_id ? { ...chat, status: 'CLOSED' } : chat
        );
        break;
  
      case 'error':
        console.error('Error recibido del servidor:', data.message);
        this.error = data.message;
        setTimeout(() => this.error = null, 5000);
        break;
        
      default:
        console.log('Evento no manejado por el agente:', data.event);
        break;
    }
  }
  
  // Función auxiliar para normalizar mensajes
  private normalizeMessage(message: any, chatId: number): any {
    return {
      id: message.id || 'temp_' + Date.now(),
      chat_id: chatId,
      message: message.message || '',
      sender_type: message.sender_type || 'UNKNOWN',
      created_at: message.created_at || message.sent_at || new Date().toISOString(),
      sent_at: message.sent_at || message.created_at || new Date().toISOString(),
      is_read: message.is_read || false
    };
  }

  private fetchActiveChats(): void {
    this.loading = true;
    const agentId = this.userService.getUser();

    if (agentId) {
      this.agentChatService.getAgentChats(agentId.agentId).subscribe({
        next: (response) => {
          this.activeChats = response.data;
          console.log(
            '🚀 ~ AgentChatPanelComponent ~ this.agentChatService.getAgentChats ~ this.activeChats:',
            this.activeChats
          );
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener chats activos:', error);
          this.error = 'No se pudieron cargar los chats';
          this.loading = false;
        },
      });
    }
  }

  selectChat(chat: any): void {
    this.selectedChat = chat;
    this.fetchChatMessages(chat.id);
  }

  fetchChatMessages(chatId: number): void {
    this.loading = true;
  
    this.agentChatService.getChatMessages(chatId).subscribe({
      next: (response) => {
        // Normalizar todos los mensajes que vienen del API
        this.messages = response.data.map((msg: any) => this.normalizeMessage(msg, chatId));
        this.loading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error al obtener mensajes:', error);
        this.error = 'No se pudieron cargar los mensajes';
        this.loading = false;
      },
    });
  }

  initiateChat(userId: number): void {
    const existingChat = this.activeChats.find(chat => 
      chat.user_id === userId && chat.status === 'ACTIVE'
    );
    
    if (existingChat) {
      console.log('Chat existente encontrado, seleccionando:', existingChat);
      this.selectChat(existingChat);
      return;
    }
    
    console.log('Iniciando nuevo chat con usuario:', userId);
    this.agentChatService.initiateChat(userId);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedChat) return;
    const messageToSend = this.newMessage.trim();
    
    const tempId = 'temp_' + Date.now();
    
    const localMessage = {
      id: tempId,
      chat_id: this.selectedChat.id,
      message: messageToSend,
      sender_type: 'AGENT',
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      is_read: true,
      isLocalTemp: true
    };
    
    this.messages.push(localMessage);
    
    this.activeChats = this.activeChats.map(chat => 
      chat.id === this.selectedChat.id ? 
      { ...chat, last_message: messageToSend } : 
      chat
    );
    
    this.newMessage = '';
    
    setTimeout(() => this.scrollToBottom(), 100);
    
    setTimeout(() => {
      this.agentChatService.sendChatMessage(this.selectedChat.id, messageToSend);
      
      console.log('Mensaje enviado al servidor desde agente con ID temporal:', {
        temp_id: tempId,
        chat_id: this.selectedChat.id,
        message: messageToSend
      });
    }, 10);
  }

  closeChat(chatId: number): void {
    const agentId = this.authService.getUserData().agent.id;
    this.agentChatService.closeChat(chatId, agentId);
  }

  scrollToBottom(): void {
    const chatContainer = document.querySelector('.messages-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
}

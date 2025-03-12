import { UserService } from './../../../modules/auth/services/user.service';
// user-chat-widget.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AgentChatService } from 'src/app/core/services/agent-chat.service';
import { ChatWebsocketService } from 'src/app/core/services/chat-websocket.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-user-chat-widget',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-chat-widget.component.html',
  styleUrls: ['./user-chat-widget.component.scss'],
})
export class UserChatWidgetComponent implements OnInit, OnDestroy {
  chatVisible = false;
  activeChats: any[] = [];
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

    this.wsSubscription = this.websocketService.getMessages().subscribe(
      (data) => this.handleWebSocketMessage(data),
      (error) => {
        console.error('Error en suscripción WebSocket:', error);
        this.error = 'Error de conexión';
      }
    );

    this.fetchUserChats();
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  private handleWebSocketMessage(data: any): void {
    console.log('Mensaje WebSocket recibido en usuario:', data);
  
    switch (data.event) {
      case 'new_chat':
        this.activeChats = [data.chat, ...this.activeChats];
    
        this.chatVisible = true;
    
        if (!this.selectedChat) {
          this.selectedChat = data.chat;
          if (data.message) {
            this.messages = [this.normalizeMessage(data.message, data.chat_id)];
          } else {
            this.messages = [];
          }
        }
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
        
        if (!messageExists && !tempMessageExists && 
            this.selectedChat && data.chat_id === this.selectedChat.id) {
          console.log('Agregando mensaje al chat seleccionado:', message);
          this.messages.push(message);
          setTimeout(() => this.scrollToBottom(), 100);
        } else {
          console.log('Mensaje ignorado (duplicado o chat no seleccionado):', 
                     { messageExists, tempMessageExists, message });
        }
    
        this.activeChats = this.activeChats.map((chat) =>
          chat.id === data.chat_id
            ? { ...chat, last_message: message.message }
            : chat
        );
        break;
      case 'chat_closed':
        if (this.selectedChat && data.chat_id === this.selectedChat.id) {
          this.selectedChat = { ...this.selectedChat, status: 'CLOSED' };
          if (data.message) {
            const closeMessage = {
              id: data.message.id || 'temp_' + Date.now(),
              chat_id: data.chat_id,
              message: data.message.message || 'Chat cerrado',
              sender_type: data.message.sender_type || 'SYSTEM',
              created_at: data.message.created_at || data.message.sent_at || new Date().toISOString(),
              is_read: data.message.is_read || false
            };
            this.messages.push(closeMessage);
            setTimeout(() => this.scrollToBottom(), 100);
          }
        }
  
        this.activeChats = this.activeChats.map((chat) =>
          chat.id === data.chat_id ? { ...chat, status: 'CLOSED' } : chat
        );
        break;
  
      case 'user_chats':
        if (data.chats && Array.isArray(data.chats)) {
          this.activeChats = data.chats;
          if (this.activeChats.length > 0) {
            this.chatVisible = true;
            if (!this.selectedChat && this.activeChats.length > 0) {
              this.selectChat(this.activeChats[0]);
            }
          }
        }
        break;
  
      case 'error':
        console.error('Error recibido del servidor:', data.message);
        this.error = data.message || 'Error en la comunicación';
        setTimeout(() => (this.error = null), 5000);
        break;
  
      default:
        console.log('Evento no manejado:', data.event);
        break;
    }
  }

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
  private fetchUserChats(): void {
    this.loading = true;
    const userId = this.userService.getUser();

    if (userId) {
      this.agentChatService.getUserChats(userId.id).subscribe({
        next: (response) => {
          this.activeChats = response.data;
          console.log(
            '🚀 ~ UserChatWidgetComponent ~ this.agentChatService.getUserChats ~ this.activeChats:',
            this.activeChats
          );

          if (this.activeChats.length > 0) {
            this.chatVisible = true;
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener chats del usuario:', error);
          this.error = 'No se pudieron cargar los chats';
          this.loading = false;
        },
      });
    }
  }

  fetchChatMessages(chatId: number): void {
    this.loading = true;
  
    this.agentChatService.getChatMessages(chatId).subscribe({
      next: (response) => {
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

  selectChat(chat: any): void {
    this.selectedChat = chat;
    this.fetchChatMessages(chat.id);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedChat) return;
  
    const messageToSend = this.newMessage.trim();
    
    const tempId = 'temp_' + Date.now();
    
    const localMessage = {
      id: tempId,
      chat_id: this.selectedChat.id,
      message: messageToSend,
      sender_type: 'USER',
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      is_read: false,
      isLocalTemp: true
    };
    
    this.messages.push(localMessage);
    
    this.activeChats = this.activeChats.map((chat) =>
      chat.id === this.selectedChat.id
        ? { ...chat, last_message: messageToSend }
        : chat
    );
    
    this.newMessage = '';
    
    setTimeout(() => this.scrollToBottom(), 100);
    
    setTimeout(() => {
      this.agentChatService.sendChatMessage(
        this.selectedChat.id,
        messageToSend
      );
      
      console.log('Mensaje enviado al servidor con ID temporal:', {
        temp_id: tempId,
        chat_id: this.selectedChat.id,
        message: messageToSend
      });
    }, 10);
  }

  toggleChatVisibility(): void {
    this.chatVisible = !this.chatVisible;
  }

  scrollToBottom(): void {
    const chatContainer = document.querySelector('.widget-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
}

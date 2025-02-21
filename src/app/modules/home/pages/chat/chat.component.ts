import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { MessageComponent } from 'src/app/shared/components/message/message.component';
import { Message } from 'src/app/core/interfaces/message.interface';
import { ChatWebsocketService } from 'src/app/core/services/chatWebsocket.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { User } from 'src/app/core/interfaces/auth.interface';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TabBarComponent,
    MessageComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  public backgroundStyle =
    'url("../../../../../assets/background/background.svg") no-repeat bottom center / cover';

  public messageText: string = '';
  public messages: Message[] = [];
  private wsSubscription!: Subscription;
  private user!: User | null

  constructor(
    private chatWebsocketService: ChatWebsocketService,
    private toastService: ToastService,
    private userService: UserService
  ) {}

  

  ngOnInit() {

    this.user = this.userService.getUser();


    this.wsSubscription = this.chatWebsocketService.connect().subscribe(
      (data) => {
        if (data.event === 'chatbot_message') {
          console.log('Mensaje del bot recibido:', data);
        }
        this.messages.push(data);
      },
      (error) => {
        console.error('WebSocket error:', error);
        this.toastService.presentToast('Error en la conexión WebSocket', 'danger');
      },
      () => {
        console.log('Conexión WebSocket cerrada');
        this.toastService.presentToast('Conexión cerrada', 'warning');
      }
    );
    
  }

  sendMessage() {
    if (this.messageText.trim() !== '') {
      const newMessage: Message = {
        id: this.messages.length + 1,
        chat_id: 4,
        sender_id: this.user?.id!,
        message: this.messageText,
        sender_type: 'USER',
        sent_at: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        status: 'sent',
      };

      this.messages.push(newMessage);
      console.log('🚀 ~ ChatComponent ~ sendMessage ~ newMessage:', newMessage);
      this.chatWebsocketService.send(newMessage);
      this.messageText = '';
    }
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }
}

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

  constructor(
    private chatWebsocketService: ChatWebsocketService,
    private toastService: ToastService
  ) {}

  

  ngOnInit() {
    this.wsSubscription = this.chatWebsocketService.connect().subscribe(
      (data) => {
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
        message: this.messageText,
        type: 'sent',
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

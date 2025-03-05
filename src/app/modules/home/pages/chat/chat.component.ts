import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { MessageComponent } from 'src/app/shared/components/message/message.component';
import { Message } from 'src/app/core/interfaces/message.interface';
import { ToastService } from 'src/app/core/services/toast.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { User } from 'src/app/core/interfaces/auth.interface';
import { WebsocketService } from 'src/app/core/services/websocket.service';
import { ActivatedRoute } from '@angular/router';

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
  private user!: User | null;
  public professionalId!: number | null;
  public specialtySelected: boolean = false;
  public confirmationSelected: boolean = false;
  public currentStep: 'specialty' | 'confirmation' = 'specialty';

  constructor(
    private websocketService: WebsocketService,
    private toastService: ToastService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    // Obtenemos el professionalId de los query params
    this.activatedRoute.queryParams.subscribe((params) => {
      this.professionalId = params['professionalId']
        ? +params['professionalId']
        : null;
      console.log('Professional ID recibido:', this.professionalId);
      this.connectWebSocket();
    });

    this.user = this.userService.getUser();
  }

  connectWebSocket() {
    // Se pasa el professionalId al método connect para que se envíe en onopen
    this.wsSubscription = this.websocketService
      .connect(this.professionalId!)
      .subscribe(
        (data) => {
          if (data.event === 'chatbot_message') {
            console.log('Mensaje del bot recibido:', data);
            if (
              data.options &&
              data.options.includes('si') &&
              data.options.includes('no')
            ) {
              this.currentStep = 'confirmation';
              this.confirmationSelected = false; // Aseguramos que esté habilitado para confirmar.
            }
            if (data.redirectUrl) {
              setTimeout(() => {
                this.navCtrl.navigateRoot(data.redirectUrl);
              }, 5000);
            }
          }

          this.messages.push(data);
        },
        (error) => {
          console.error('WebSocket error:', error);
          this.toastService.presentToast(
            'Error en la conexión WebSocket',
            'danger'
          );
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
      this.websocketService.send(newMessage);
      this.messageText = '';
    }
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  handleOptionSelected(option: string) {
    // Si el mensaje actual es para la especialidad, usa specialtySelected.
    if (this.currentStep === 'specialty') {
      if (this.specialtySelected) return;
      this.specialtySelected = true;
    }

    // Si es para confirmación, usamos confirmationSelected.
    if (this.currentStep === 'confirmation') {
      if (this.confirmationSelected) return;
      this.confirmationSelected = true;
    }

    console.log('Opción seleccionada:', option);
    this.messageText = option;
    this.sendMessage();
  }
}

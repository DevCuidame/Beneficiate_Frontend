import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, IonContent, Platform } from '@ionic/angular';
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
import { environment } from 'src/environments/environment';
import { Keyboard } from '@capacitor/keyboard';

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
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  
  // Eliminamos la referencia al background con imagen
  public backgroundStyle = 'url("../../../../../assets/background/background.svg") no-repeat bottom center / cover';

  public messageText: string = '';
  public messages: Message[] = [];
  private wsSubscription!: Subscription;
  public user!: User | null;
  public professionalId!: number | null;
  public specialtySelected: boolean = false;
  public confirmationSelected: boolean = false;
  public currentStep: 'specialty' | 'confirmation' = 'specialty';
  public api = environment.url

  cardDefaultHeight: string = '50%';
  cardHeight: string = this.cardDefaultHeight;
  private keyboardWillShowListener: any;
  private keyboardWillHideListener: any;

  constructor(
    private websocketService: WebsocketService,
    private toastService: ToastService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.setupKeyboardListeners();
    
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
    this.wsSubscription = this.websocketService
      .connect(this.professionalId!)
      .subscribe(
        (data) => {
          // Validamos que el mensaje tenga contenido antes de añadirlo
          if (data && data.message && data.message.trim() !== '') {
            console.log('Mensaje recibido por WebSocket:', data);
            
            if (data.event === 'chatbot_message') {
              if (
                data.options &&
                data.options.includes('si') &&
                data.options.includes('no')
              ) {
                this.currentStep = 'confirmation';
                this.confirmationSelected = false;
              }
              if (data.redirectUrl) {
                setTimeout(() => {
                  this.navCtrl.navigateRoot(data.redirectUrl);
                }, 5000);
              }
            }

            this.messages.push(data);
            this.scrollToBottom();
          } else {
            console.warn('Mensaje vacío recibido, ignorando:', data);
          }
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
      this.scrollToBottom();
    }
  }

  // Método para desplazarse al último mensaje
  scrollToBottom() {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(300);
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }

    if (this.keyboardWillShowListener) this.keyboardWillShowListener.remove();
    if (this.keyboardWillHideListener) this.keyboardWillHideListener.remove();
  }

  handleOptionSelected(option: string) {
    console.log('Opción seleccionada:', option, 'Paso actual:', this.currentStep);
    
    if (this.currentStep === 'specialty') {
      if (this.specialtySelected) {
        console.log('Especialidad ya seleccionada, ignorando.');
        return;
      }
      this.specialtySelected = true;
      console.log('Especialidad marcada como seleccionada');
    }

    if (this.currentStep === 'confirmation') {
      if (this.confirmationSelected) {
        console.log('Confirmación ya seleccionada, ignorando.');
        return;
      }
      this.confirmationSelected = true;
      console.log('Confirmación marcada como seleccionada');
    }

    this.messageText = option;
    this.sendMessage();
  }

  private setupKeyboardListeners() {
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (info) => {
        const keyboardHeight = info.keyboardHeight;
        this.cardHeight = `calc(100% - ${keyboardHeight}px)`;
      });

      this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
        this.cardHeight = this.cardDefaultHeight;
      });
    } else {
      window.addEventListener('resize', () => {
        const viewportHeight = window.innerHeight;
        const originalHeight = window.outerHeight;
        
        if (originalHeight - viewportHeight > 150) {
          this.cardHeight = '80%'; 
        } else {
          this.cardHeight = this.cardDefaultHeight;
        }
      });
    }
  }
}
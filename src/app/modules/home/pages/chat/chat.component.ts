import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  IonicModule,
  NavController,
  IonContent,
  Platform,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { WebsocketService } from 'src/app/core/services/websocket.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/core/interfaces/auth.interface';
import { Message } from 'src/app/core/interfaces/message.interface';
import { environment } from 'src/environments/environment';
import { Keyboard } from '@capacitor/keyboard';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { MessageComponent } from 'src/app/shared/components/message/message.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TabBarComponent,
    MessageComponent,
  ],
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  public backgroundStyle =
    'url("../../../../../assets/background/background.svg") no-repeat bottom center / cover';
  @Output() toggle: EventEmitter<void> = new EventEmitter();
  @Input() inputProfessionalId!: number | null;
  @Input() isHeaderEnable: boolean = false;

  public messageText: string = '';
  public messages: Message[] = [];
  private wsSubscription!: Subscription;
  public user!: User | null;
  public professionalId!: number | null;
  public isConnecting: boolean = false;
  public connectionError: boolean = false;

  // Estados para los diferentes pasos del flujo
  public documentEntered: boolean = false;
  public citySelected: boolean = false;
  public specialtySelected: boolean = false;
  public visitTypeSelected: boolean = false; 
  public descriptionEntered: boolean = false;
  public confirmationSelected: boolean = false;

  // Estado actual del chatbot
  public currentStep:
    | 'document'
    | 'city'
    | 'specialty'
    | 'visitType'
    | 'description'
    | 'confirmation' = 'document';

  public api = environment.url;

  cardDefaultHeight: string = '50%';
  cardHeight: string = this.cardDefaultHeight;
  private keyboardWillShowListener: any;
  private keyboardWillHideListener: any;
  public userImage: string = '';

  constructor(
    private websocketService: WebsocketService,
    private toastService: ToastService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.user = this.userService.getUser();

    if (this.user?.image?.image_path) {
      this.userImage = this.api + this.user?.image?.image_path;
    } else {
      this.userImage = 'assets/images/default_user.png';
    }

    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      this.setupKeyboardListeners();
    }

    if (this.inputProfessionalId !== null) {
      this.setProfessionalId();
      this.connectWebSocket();
    } else {
      this.setupKeyboardListeners();

      // Obtenemos el professionalId de los query params
      this.activatedRoute.queryParams.subscribe((params) => {
        this.professionalId = params['professionalId']
          ? +params['professionalId']
          : null;
        this.connectWebSocket();
      });
    }
  }

  connectWebSocket() {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.connectionError = false;

    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }

    this.wsSubscription = this.websocketService
      .resetConnection(this.professionalId!)
      .subscribe({
        next: (data) => {
          this.isConnecting = false;
          this.connectionError = false;

          // Validamos que el mensaje tenga contenido antes de añadirlo
          if (data && data.message && data.message.trim() !== '') {
            // Procesar el evento de chatbot
            if (data.event === 'chatbot_message') {
              // Crear objeto de mensaje con el formato adecuado para nuestro componente
              const newMessage: Message = {
                id: this.messages.length + 1,
                chat_id: 4, // Valor predeterminado
                sender_id: 0, // Bot o sistema no tiene ID relevante
                message: data.message,
                sender_type: 'BOT',
                sent_at: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                }),
                status: 'sent',
                // Agregar propiedades para las opciones seleccionables
                list: data.list,
                options: data.options || [],
              };

              // Determinar el paso actual basado en el contenido del mensaje
              if (data.message.toLowerCase().includes('documento')) {
                this.currentStep = 'document';
                this.documentEntered = false;
              } else if (data.message.toLowerCase().includes('ciudad')) {
                this.currentStep = 'city';
                this.citySelected = false;
              } else if (data.message.toLowerCase().includes('especialidad')) {
                this.currentStep = 'specialty';
                this.specialtySelected = false;
              } else if (
                data.message.toLowerCase().includes('primera vez') ||
                data.message.toLowerCase().includes('control')
              ) {
                this.currentStep = 'visitType';
                this.visitTypeSelected = false;
              } else if (
                data.message.toLowerCase().includes('motivo') ||
                data.message.toLowerCase().includes('descripción')
              ) {
                this.currentStep = 'description';
                this.descriptionEntered = false;
              } else if (data.message.toLowerCase().includes('confirmar')) {
                this.currentStep = 'confirmation';
                this.confirmationSelected = false;
              }

              // Manejar redirección si existe
              if (data.redirectUrl) {
                setTimeout(() => {
                  // this.navCtrl.navigateRoot(data.redirectUrl);
                }, 5000);
              }

              this.messages.push(newMessage);
            } else {
              // Otros tipos de mensajes
              this.messages.push(data);
            }

            this.scrollToBottom();
          }
        },
        error: (error) => {
          this.isConnecting = false;
          this.connectionError = true;
        
          // Verificar si es un error específico de falta de plan
          if (error.message && error.message.includes('sin plan activo')) {
            // Mostrar mensaje específico en vez de intentar reconectar
            const planMessage: Message = {
              id: this.messages.length + 1,
              chat_id: 4,
              sender_id: 0,
              message: 'Para acceder a esta funcionalidad, necesitas tener un plan activo. Por favor, contrata un plan para continuar.',
              sender_type: 'BOT',
              sent_at: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }),
              status: 'sent',
            };
            
            this.messages.push(planMessage);
            this.scrollToBottom();
            
            // No intentar reconectar en este caso específico
            return;
          }
          console.error('Error en la conexión WebSocket:', error);

          // Solo mostrar una notificación si hay un error genuino (no durante reconexiones)
          if (!error.message || !error.message.includes('Reconectando')) {
            this.toastService.presentToast(
              'Error en la conexión WebSocket. Intentando reconectar...',
              'danger'
            );
          }

          // Agregar mensaje de error al chat para el usuario
          const errorMessage: Message = {
            id: this.messages.length + 1,
            chat_id: 4,
            sender_id: 0,
            message:
              'Tenemos problemas con la conexión. Por favor, espere mientras nos reconectamos...',
            sender_type: 'BOT',
            sent_at: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
            status: 'sent',
          };

          this.messages.push(errorMessage);
          this.scrollToBottom();

          // Intentar reconectar manualmente después de un tiempo
          setTimeout(() => {
            if (this.connectionError) {
              this.connectWebSocket();
            }
          }, 5000); // Esperar 5 segundos antes de reintentar
        },
        complete: () => {
          this.isConnecting = false;

          // Solo mostrar el mensaje si no hay error de conexión
          if (!this.connectionError) {
            console.log('Conexión WebSocket cerrada normalmente');
            this.toastService.presentToast('Conexión cerrada', 'warning');
          }
        },
      });
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

      // Actualizar el estado del paso actual
      switch (this.currentStep) {
        case 'document':
          this.documentEntered = true;
          break;
        case 'city':
          this.citySelected = true;
          break;
        case 'specialty':
          this.specialtySelected = true;
          break;
        case 'visitType':
          this.visitTypeSelected = true;
          break;
        case 'description':
          this.descriptionEntered = true;
          break;
        case 'confirmation':
          this.confirmationSelected = true;
          break;
      }

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

  setProfessionalId() {
    this.professionalId = this.inputProfessionalId;
  }

  closeChat() {
    this.toggle.emit();
  }

  handleOptionSelected(option: string) {
    // Evitar selecciones duplicadas en el mismo paso
    switch (this.currentStep) {
      case 'document':
        if (this.documentEntered) return;
        break;
      case 'city':
        if (this.citySelected) return;
        break;
      case 'specialty':
        if (this.specialtySelected) return;
        break;
      case 'visitType':
        if (this.visitTypeSelected) return;
        break;
      case 'description':
        if (this.descriptionEntered) return;
        break;
      case 'confirmation':
        if (this.confirmationSelected) return;
        break;
    }

    this.messageText = option;
    this.sendMessage();
  }

  private setupKeyboardListeners() {
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      this.keyboardWillShowListener = Keyboard.addListener(
        'keyboardWillShow',
        (info) => {
          const keyboardHeight = info.keyboardHeight;
          this.cardHeight = `calc(100% - ${keyboardHeight}px)`;
        }
      );

      this.keyboardWillHideListener = Keyboard.addListener(
        'keyboardWillHide',
        () => {
          this.cardHeight = this.cardDefaultHeight;
        }
      );
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

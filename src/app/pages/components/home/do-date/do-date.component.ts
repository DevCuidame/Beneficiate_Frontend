import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-do-date',
  imports: [
    IonicModule
  ],
  templateUrl: './do-date.component.html',
  styleUrls: ['./do-date.component.scss'],
})
export class DoDateComponent {
  @Output() toggleWht = new EventEmitter<void>();
  @Output() toggleChat = new EventEmitter<void>();
  @Input() phoneNumber: string = '';
  @Input() message: string = '';

  constructor(private loadingCtrl: LoadingController) { }

  openWhatsapp = async () => {
    const loading = await this.showLoading();
    try {
      const whatsappUrl =
        'whatsapp://send?phone=573043520351&text=Hola, quiero agendar una cita con el doctor';
      window.location.href = whatsappUrl;

      setTimeout(() => {
        window.open(
          'https://web.whatsapp.com/send?phone=573043520351&text=Hola, quiero agendar una cita con el doctor',
          '_blank'
        );
      }, 500);
      this.toggleWht.emit();
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
    } finally {
      if (loading) {
        loading.dismiss();
      }
    }
  };

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Espera un momento, por favor...',
      cssClass: 'custom-loading',
    });

    loading.present();
    return loading;
  }

  // Función que emite el evento al componente padre
  triggerToggleChat() {
    this.toggleChat.emit();
  }
}

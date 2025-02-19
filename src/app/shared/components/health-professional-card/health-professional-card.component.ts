import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-health-professional-card',
  templateUrl: './health-professional-card.component.html',
  styleUrls: ['./health-professional-card.component.scss'],
})
export class HealthProfessionalCardComponent implements OnInit {

  constructor(private alertCtrl: AlertController, private navCtrl: NavController) { }

  ngOnInit() {}

  async onSolicitarCita() {
    const alert = await this.alertCtrl.create({
      header: 'Solicitar cita',
      message: 'Selecciona el método de contacto que prefieras',
      cssClass: 'two-button-alert', // Clase personalizada para aumentar la especificidad
      buttons: [
        {
          text: 'Whatsapp',
          // icon: 'logo-whatsapp', // Ionic 8 permite usar icon
          cssClass: 'whatsapp-button',
          handler: () => {
            console.log('WhatsApp presionado');
          }
        },
        {
          text: 'Chat',
          // icon: 'chatbubbles-outline',
          cssClass: 'chat-button',
          handler: () => {
            console.log('Chat presionado');
            this.navCtrl.navigateForward(['/home/chat']);

          }
        }
      ]
    });
    await alert.present();
    
  }
}

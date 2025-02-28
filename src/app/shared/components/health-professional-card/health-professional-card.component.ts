import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-health-professional-card',
  imports: [CommonModule],
  templateUrl: './health-professional-card.component.html',
  styleUrls: ['./health-professional-card.component.scss'],
})
export class HealthProfessionalCardComponent implements OnInit {

  @Input() first_name: string = ''; 
  @Input() last_name: string = ''; 
  @Input() specialty_name: string = ''; 
  @Input() profileImage: string = 'assets/images/test_doctor.svg'; 
  @Input() buttonVisible: boolean = true;
  @Input() agendaColor: string = 'var(--ion-color-primary)';

  public api = environment.url;

  constructor(private alertCtrl: AlertController, private navCtrl: NavController) { }

  ngOnInit() {}

  async onSolicitarCita() {
    const alert = await this.alertCtrl.create({
      header: 'Solicitar cita',
      message: 'Selecciona el método de contacto que prefieras',
      cssClass: 'two-button-alert', 
      buttons: [
        {
          text: 'Whatsapp',
          cssClass: 'whatsapp-button',
          handler: () => {
            console.log('WhatsApp presionado');
          }
        },
        {
          text: 'Chat',
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

import { Component, Input  } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-do-date',
  imports: [
    IonicModule
  ],
  templateUrl: './do-date.component.html',
  styleUrls: ['./do-date.component.scss'],
})
export class DoDateComponent {
  @Input() phoneNumber: string = '';
  @Input() message: string = '';

  constructor() { }

  redirectToWhatsApp() {
    const encodedMessage = encodeURIComponent(this.message);
    const url = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  }
}

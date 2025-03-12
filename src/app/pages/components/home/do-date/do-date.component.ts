import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() toggle = new EventEmitter<void>(); // Evento para activar la función del padre
  @Input() phoneNumber: string = '';
  @Input() message: string = '';

  constructor() { }

  redirectToWhatsApp() {
    const encodedMessage = encodeURIComponent(this.message);
    const url = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  }

  // Función que emite el evento al componente padre
  triggerToggleChat() {
    this.toggle.emit(); // Emite el evento
  }
}

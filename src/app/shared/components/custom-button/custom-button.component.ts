import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-custom-button',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './custom-button.component.html',
  styleUrls: ['./custom-button.component.scss'],
})
export class CustomButtonComponent {
  @Input() label: string = 'Botón';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() color: string = 'var(--ion-color-primary)';
  @Input() textColor: string = 'var(--ion-color-light)';  // Nuevo input para color de texto
  @Input() backgroundImage: string = ''; // Nuevo input para imagen de fondo
}

import { Component, Input  } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plan-card',
  imports: [CommonModule],
  templateUrl: './plan-card.component.html',
  styleUrls: ['./plan-card.component.scss'],
})
export class PlanCardComponent {
  @Input() imagen: string = '';
  @Input() titulo: string = '';
  @Input() precio: string = '';
  @Input() descripcion: string = '';
  @Input() botonTexto: string = 'Adquirir';
  @Input() customStyle: string = '';
}

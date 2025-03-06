import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-nosotros-page',
  standalone: true,
    imports: [
      CommonModule,
      HeaderComponent
    ],
  templateUrl: './nosotros-page.component.html',
  styleUrls: ['./nosotros-page.component.scss'],
})
export class NosotrosPageComponent  implements OnInit {
  textoCard: string[] = [
    'Presencia en <span class="change-c">55</span> ciudades',
    'Más de <span class="change-c">3200</span> prestadores de <span class="change-c">servicios</span>',
    'Más de <span class="change-c">90 laboratorios <span class="change-c">clínicos</span>',
    '<span class="change-c">42</span> especialidades médicas',
    '<span class="change-c">Sin</span> importar enfermedades preexistentes',
    '<span class="change-c">Sin</span> periodos de carencia',
    '<span class="change-c">Atención</span> máxima en 72 horas',
    '<span class="change-c">Uso</span> ilimitado'
  ];

  constructor() { }

  ngOnInit() {
  }

}

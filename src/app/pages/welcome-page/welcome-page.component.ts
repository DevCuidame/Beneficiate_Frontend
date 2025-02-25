import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '../components/header/header.component';
import { PlanCardComponent } from '../components/plans-card/plan-card.component';

@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [
    CommonModule,
    PlanCardComponent,
    HeaderComponent
  ],
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
})
export class WelcomePageComponent  implements OnInit {
  activeIndex: number = 0;
  intervalId: any;
  showText = true;

  public imgPlanFamiliar: string = '../../../assets/images/Desktop/plan-card-familiar.png';
  public imgPlanIndividual: string = '../../../assets/images/Desktop/plan-card-individual.png';

  imagesBanner: string[] = [
    '../../../assets/images/Desktop/banner.jpg',
    '../../../assets/images/Desktop/banner-2.jpg',
    '../../../assets/images/Desktop/banner-3.jpg',
  ];
  textoBanner: string[] = [
    'Somos la plataforma tecnológica que redefine la forma de acceder a la salud en <span class="change-c">Colombia.</span>',
    'Presencia en <span class="change-c">55</span> ciudades, más de <span class="change-c">3200</span> prestadores de servicios, atención y eventualidades médicas.',
    'Conectamos las <span class="change-c">necesidades</span> médicas de nuestros usuarios con los <span class="change-c">mejores</span> especialistas y servicios de salud del país.',
  ];

  constructor() { }

  ngOnInit(): void {
    this.startImageRotation();
  }

  changeImage(index: number): void {
    this.showText = false; // Oculta el texto para reiniciar la animación

    setTimeout(() => {
      this.activeIndex = index; // Cambia la imagen
      this.showText = true; // Reactiva el texto con animación
    }, 100); // Pequeño retraso para que Angular note el cambio
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  startImageRotation(): void {
    this.intervalId = setInterval(() => {
      this.showText = false; // Oculta el texto para reiniciar la animación

      setTimeout(() => {
        this.activeIndex = (this.activeIndex + 1) % this.imagesBanner.length;
        this.showText = true; // Reactiva el texto con la animación
      }, 100); // Pequeño retraso para forzar el cambio
    }, 10000);
  }


}

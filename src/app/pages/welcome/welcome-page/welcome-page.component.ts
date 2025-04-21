import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import { Plan, PaymentService } from 'src/app/core/services/payment.service';

import { HeaderComponent } from '../../components/header/header.component';
import { PlanCardComponent } from '../../components/plans-card/plan-card.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { whatsappBtnComponent } from '../../components/whtsp-btn/whtsp-btn.component';

@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [
    CommonModule,
    PlanCardComponent,
    HeaderComponent,
    FooterComponent,
    whatsappBtnComponent
  ],
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
})
export class WelcomePageComponent  implements OnInit {
  activeIndex: number = 0;
  width: number = 0;
  intervalId: any;
  showText = true;
  isLoading = false;
  public plans: Plan[] = [];

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

  constructor(
    private router: Router, 
    private loadingController: LoadingController,
    private toastController: ToastController,
    private paymentService: PaymentService,
  ) {}

  ngOnInit(): void {
    this.startImageRotation();
    this.loadPlans();
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.getScreenSize();
  }

  getScreenSize() {
    this.width = window.innerWidth;
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

    async loadPlans() {
      this.paymentService.getPlans().subscribe({
        next: (plans) => {
          // Verificar si planes es un array
          if (Array.isArray(plans)) {
            this.plans = plans.filter(plan => plan && plan.is_active);
          } else if (plans && typeof plans === 'object') {
            // Si es un objeto, convertirlo a array
            this.plans = Object.values(plans as Record<string, Plan>).filter(plan => plan && plan.is_active);
          } else {
            console.error('Formato de planes inesperado:', plans);
            this.plans = [];
          }
  
        },
        error: async (error) => {
          console.error('Error al cargar planes:', error);
          const toast = await this.toastController.create({
            message: 'No se pudieron cargar los planes. Intenta de nuevo.',
            duration: 3000,
            position: 'bottom',
            color: 'danger'
          });
          toast.present();
        }
      });
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

  navigateToLogin() {
    this.router.navigate(['/desktop/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/desktop/register']);
  }
}

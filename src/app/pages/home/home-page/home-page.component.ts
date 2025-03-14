import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';

import { UserService } from '../../../modules/auth/services/user.service';
import { User } from 'src/app/core/interfaces/auth.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { Plan, PaymentService } from 'src/app/core/services/payment.service';

import { InfoUserComponent } from '../../components/home/info-user/info-user.component';
import { HeaderComponent } from '../../components/home/header/header.component';
import { FooterComponent } from '../../components/footer-component/footer-component.component';
import { BeneficiaryCardComponent } from '../../components/home/beneficiary-card/beneficiary-card.component';
import { PlanCardComponent } from '../../components/plans-card/plan-card.component';

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    InfoUserComponent,
    HeaderComponent,
    FooterComponent,
    BeneficiaryCardComponent,
    PlanCardComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  @Output() planSelected = new EventEmitter<Plan>();
  selectedButton: string = 'beneficiarios';
  selectedPanel: string = 'beneficiarios';
  isLoading = false;
  isProcessing = false;
  numBeneficiary = <any> '';

  public beneficiaries: Beneficiary[] = [];
  public user: User | null = null;
  public plans: Plan[] = [];

  public imgPlanFamiliar: string = '../../../../assets/images/Desktop/plan-card-familiar.png';
  public imgPlanIndividual: string = '../../../../assets/images/Desktop/plan-card-individual.png';

  constructor(
    private userService: UserService,
    private beneficiaryService: BeneficiaryService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private paymentService: PaymentService,
  ) {}

  ngOnInit() {
    this.userService.user$.subscribe((userData) => {
      if (Array.isArray(userData) && userData.length > 0) {
        this.user = userData[0];
      } else {
        this.user = userData;
      }
    });

    this.beneficiaryService.beneficiaries$.subscribe((beneficiaries) => {
      if (Array.isArray(beneficiaries)) {
        this.numBeneficiary = beneficiaries.length;
        this.beneficiaries = beneficiaries.map((beneficiary) => ({
          ...beneficiary,
          image: Array.isArray(beneficiary.image) && beneficiary.image.length > 0 ? beneficiary.image[0] : null,
        }));
      }
    });

    this.loadPlans();
  }

  selectButton(panel: string) {
    this.selectedButton = panel;
    this.selectedPanel = panel;
  }

  async loadPlans() {
    const loading = await this.loadingController.create({
      message: 'Cargando planes...',
      spinner: 'circular'
    });
    await loading.present();
    this.isLoading = true;

    this.paymentService.getPlans().subscribe({
      next: (plans) => {
        console.log('Planes recibidos:', plans);

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

        this.isLoading = false;
        loading.dismiss();
      },
      error: async (error) => {
        console.error('Error al cargar planes:', error);
        this.isLoading = false;
        loading.dismiss();
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
}

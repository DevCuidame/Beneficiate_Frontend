import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';

import { UserService } from '../../../modules/auth/services/user.service';
import { User } from 'src/app/core/interfaces/auth.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { Plan, PaymentService } from 'src/app/core/services/payment.service';

import { InfoUserComponent } from '../../components/home/info-user/info-user.component';
import { HeaderComponent } from '../../components/home/header/header.component';
import { FollowUsComponent } from '../../components/follow-us/follow-us.component';
import { BeneficiaryCardComponent } from '../../components/home/beneficiary-card/beneficiary-card.component';
import { PlanCardComponent } from '../../components/plans-card/plan-card.component';
import { PlanSelectionService } from 'src/app/core/services/plan-selection.service';
import { Subscription } from 'rxjs';
import { InlinePaymentComponent } from 'src/app/shared/components/inline-payment/inline-payment.component';

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    InfoUserComponent,
    HeaderComponent,
    FollowUsComponent,
    BeneficiaryCardComponent,
    PlanCardComponent,
    IonicModule
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
  numBeneficiary = <any>'';

  private subscriptions: Subscription[] = [];

  public beneficiaries: Beneficiary[] = [];
  public user: User | null = null;
  public plans: Plan[] = [];

  public selectedPlanFromRegister: Plan | null = null;
  public hasPlanBeenSelected: boolean = false;

  public imgPlanFamiliar: string =
    '../../../../assets/images/Desktop/plan-card-familiar.png';
  public imgPlanIndividual: string =
    '../../../../assets/images/Desktop/plan-card-individual.png';

  constructor(
    public userService: UserService,
    private beneficiaryService: BeneficiaryService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private paymentService: PaymentService,
    private planSelectionService: PlanSelectionService,
    private modalController: ModalController,
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
          image:
            Array.isArray(beneficiary.image) && beneficiary.image.length > 0
              ? beneficiary.image[0]
              : null,
        }));
      }
    });

    this.loadPlans();

    setTimeout(() => {
      this.checkPlanSelection();
    }, 200);

  }
checkPlanSelection(): void {
  // Forzar actualización desde sessionStorage
  this.planSelectionService.forceRefreshFromStorage();
  
  // Variable para controlar si debemos iniciar el pago automáticamente
  let shouldInitiatePayment = false;
  
  // Verificar directamente en el sessionStorage
  const storedPlan = sessionStorage.getItem('selectedPlan');
  
  if (storedPlan) {
    try {
      const plan = JSON.parse(storedPlan) as Plan;
      this.selectedPlanFromRegister = plan;
      this.hasPlanBeenSelected = true;
      this.selectedPanel = 'planes';
      this.selectedButton = 'planes';
      
      // Marcamos que se debe iniciar el pago automáticamente
      shouldInitiatePayment = true;
      
    } catch (e) {
      console.error('Error al parsear el plan desde sessionStorage:', e);
      sessionStorage.removeItem('selectedPlan');
    }
  }

  // Suscribirse al plan seleccionado
  const planSub = this.planSelectionService.selectedPlan$.subscribe((plan) => {
    if (plan) {
      this.selectedPlanFromRegister = plan;
      this.hasPlanBeenSelected = true;
      this.selectedPanel = 'planes';
      this.selectedButton = 'planes';
    }
  });
  this.subscriptions.push(planSub);

  // Suscribirse al estado de selección de plan
  const hasSelectedSub = this.planSelectionService.hasPlanSelected$.subscribe((hasSelected) => {
    this.hasPlanBeenSelected = hasSelected;
  });
  this.subscriptions.push(hasSelectedSub);
  
  // Si debemos iniciar el pago y tenemos los planes cargados, iniciamos después de un breve retraso
  // para asegurar que los componentes hijo estén cargados
  if (shouldInitiatePayment) {
    // Esperar a que los planes estén cargados
    const checkPlansAndInitiate = () => {
      if (this.plans && this.plans.length > 0) {
        // Pequeño retraso para asegurar que los componentes se han renderizado
        setTimeout(() => {
          this.initiatePaymentAutomatically();
        }, 500);
      } else {
        // Si aún no hay planes, volvemos a verificar en un momento
        setTimeout(checkPlansAndInitiate, 200);
      }
    };
    
    checkPlansAndInitiate();
  }
}

// Nuevo método para iniciar el pago automáticamente
initiatePaymentAutomatically(): void {
  
  if (!this.selectedPlanFromRegister) {
    console.error('No hay plan seleccionado para iniciar pago automático');
    return;
  }
  
  // Crear el modal de pago directamente desde el componente principal
  this.startPaymentProcess(this.selectedPlanFromRegister.id);
}

// Nuevo método para centralizar el proceso de pago
async startPaymentProcess(planId: number): Promise<void> {
  
  if (!planId) {
    const toast = await this.toastController.create({
      message: 'No se pudo identificar el plan seleccionado.',
      duration: 2000,
      position: 'bottom',
      color: 'warning'
    });
    toast.present();
    return;
  }

  const loading = await this.loadingController.create({
    message: 'Iniciando proceso de pago...',
    spinner: 'circular'
  });
  await loading.present();

  this.paymentService.initiatePayment(planId).subscribe({
    next: async (paymentTransaction) => {
      loading.dismiss();

      if (!paymentTransaction.redirectUrl) {
        const toast = await this.toastController.create({
          message: 'No se pudo obtener el enlace de pago',
          duration: 4000,
          position: 'bottom',
          color: 'danger'
        });
        toast.present();
        return;
      }

      try {
        // Abrir modal de pago
        const modal = await this.modalController.create({
          component: InlinePaymentComponent,
          componentProps: {
            paymentUrl: paymentTransaction.redirectUrl,
            transactionId: paymentTransaction.transactionId
          },
          cssClass: 'payment-modal',
          backdropDismiss: false
        });

        await modal.present();

        const { data } = await modal.onDidDismiss();

        this.planSelectionService.clearPlanSelection();

        if (data?.success) {
          const toast = await this.toastController.create({
            message: '¡Pago completado con éxito! Tu plan ha sido actualizado.',
            duration: 5000,
            position: 'middle',
            color: 'success',
            buttons: [
              {
                text: 'OK',
                role: 'cancel',
                handler: () => {
                  // Recargar datos del usuario
                  window.location.reload();
                }
              }
            ]
          });
          toast.present();
          
          // Limpiar la selección si el pago fue exitoso
          this.planSelectionService.clearPlanSelection();
        } else {
          // Verificar una vez más el estado del pago
          this.verifyPaymentStatus(paymentTransaction.transactionId);
        }
      } catch (error) {
        console.error('Error mostrando el modal de pago:', error);
        const toast = await this.toastController.create({
          message: 'Hubo un problema con la pasarela de pago',
          duration: 4000,
          position: 'bottom',
          color: 'danger'
        });
        toast.present();
      }
    },
    error: async (error) => {
      console.error('Error iniciando pago:', error);
      loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Error al iniciar el pago. Intenta de nuevo.',
        duration: 4000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
    }
  });
}

// Método para verificar el estado del pago
async verifyPaymentStatus(transactionId: string): Promise<void> {
  const loading = await this.loadingController.create({
    message: 'Verificando estado del pago...',
    spinner: 'circular'
  });
  await loading.present();

  this.paymentService.verifyTransaction(transactionId).subscribe({
    next: async (success) => {
      loading.dismiss();
      if (success) {
        const toast = await this.toastController.create({
          message: '¡Pago completado con éxito! Tu plan ha sido actualizado.',
          duration: 5000,
          position: 'middle',
          color: 'success',
          buttons: [
            {
              text: 'OK',
              role: 'cancel',
              handler: () => {
                // Recargar datos del usuario
                window.location.reload();
              }
            }
          ]
        });
        toast.present();
        
        // Limpiar la selección del plan si el pago fue exitoso
        this.planSelectionService.clearPlanSelection();
      } else {
        const toast = await this.toastController.create({
          message: 'El pago no se completó o está pendiente de confirmación.',
          duration: 4000,
          position: 'bottom',
          color: 'warning'
        });
        toast.present();
      }
    },
    error: async (error) => {
      console.error('Error verificando pago:', error);
      loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Error al verificar el pago. Contacta a soporte si el problema persiste.',
        duration: 4000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
    }
  });
}


  ngOnDestroy() {
  }

  selectButton(panel: string) {
    this.selectedButton = panel;
    this.selectedPanel = panel;
  }

  async loadPlans() {
    const loading = await this.loadingController.create({
      message: 'Cargando planes...',
      spinner: 'circular',
    });
    await loading.present();
    this.isLoading = true;

    this.paymentService.getPlans().subscribe({
      next: (plans) => {
        // Verificar si planes es un array
        if (Array.isArray(plans)) {
          this.plans = plans.filter((plan) => plan && plan.is_active);
        } else if (plans && typeof plans === 'object') {
          // Si es un objeto, convertirlo a array
          this.plans = Object.values(plans as Record<string, Plan>).filter(
            (plan) => plan && plan.is_active
          );
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
          color: 'danger',
        });
        toast.present();
      },
    });
  }
}

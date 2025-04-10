import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  IonicModule,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { Plan, PaymentService } from 'src/app/core/services/payment.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCrown,
  faUser,
  faCalendarAlt,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { InlinePaymentComponent } from '../../inline-payment/inline-payment.component';
import { PaymentConfirmationModalComponent } from '../../payment-confirmation-modal/payment-confirmation-modal';

@Component({
  selector: 'app-plan-selection',
  standalone: true,
  imports: [CommonModule, IonicModule, FontAwesomeModule, CurrencyPipe],
  templateUrl: './plan-selection.component.html',
  styleUrls: ['./plan-selection.component.scss'],
})
export class PlanSelectionComponent implements OnInit {
  @Output() planSelected = new EventEmitter<Plan>();

  // Font Awesome Icons
  faCrown = faCrown;
  faUser = faUser;
  faCalendarAlt = faCalendarAlt;
  faCheckCircle = faCheckCircle;

  plans: Plan[] = [];
  selectedPlanId: number | null = null;
  isLoading = false;
  isProcessing = false;

  constructor(
    private paymentService: PaymentService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadPlans();
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
        console.log('Planes recibidos:', plans);

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

  selectPlan(plan: Plan) {
    this.selectedPlanId = plan.id;
    this.planSelected.emit(plan);
  }

  async initiatePayment() {
    if (!this.selectedPlanId) {
      const toast = await this.toastController.create({
        message: 'Por favor selecciona un plan.',
        duration: 2000,
        position: 'bottom',
        color: 'warning',
      });
      toast.present();
      return;
    }
  
    this.isProcessing = true;
    const loading = await this.loadingController.create({
      message: 'Iniciando proceso de pago...',
      spinner: 'circular',
    });
    await loading.present();
  
    this.paymentService.initiatePayment(this.selectedPlanId).subscribe({
      next: async (paymentTransaction) => {
        loading.dismiss();
        this.isProcessing = false;
  
        // Verificar si tenemos una URL de redirección
        if (!paymentTransaction.redirectUrl) {
          this.showErrorMessage('No se pudo obtener el enlace de pago');
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
          
          if (data?.success) {
            this.showSuccessMessage(data.details?.planName || 'Plan');
          } else {
            // Verificar una vez más por si acaso se cerró el modal manualmente
            this.verifyPaymentStatus(paymentTransaction.transactionId);
          }
        } catch (error) {
          console.error('Error mostrando el modal de pago:', error);
          this.showErrorMessage('Hubo un problema con la pasarela de pago');
        }
  
        // Configurar verificación automática como respaldo
        setTimeout(() => {
          // Verificar estado después de 20 segundos en caso de problemas
          this.paymentService.verifyTransactionDetails(paymentTransaction.transactionId)
            .subscribe({
              next: (result) => {
                if (result.success) {
                  this.showSuccessMessage(result.planName || 'Plan');
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                } else {
                  // Mostrar modal de confirmación si aún está pendiente
                  this.showPaymentConfirmationModal(paymentTransaction.transactionId);
                }
              },
              error: (error) => {
                console.error('Error en verificación automática:', error);
                // Intentar mostrar el modal de confirmación incluso si hay error
                this.showPaymentConfirmationModal(paymentTransaction.transactionId);
              }
            });
        }, 20000); // Verificar después de 20 segundos
      },
      error: async (error) => {
        console.error('Error iniciando pago:', error);
        loading.dismiss();
        this.isProcessing = false;
        this.showErrorMessage('Error al iniciar el pago. Intenta de nuevo.');
      },
    });
  }
  
  // Método auxiliar para mostrar el modal de confirmación
  async showPaymentConfirmationModal(transactionId: string) {
    try {
      const confirmModal = await this.modalController.create({
        component: PaymentConfirmationModalComponent,
        componentProps: {
          transactionId: transactionId
        },
        cssClass: 'payment-confirmation-modal'
      });
      
      await confirmModal.present();
    } catch (error) {
      console.error('Error mostrando modal de confirmación:', error);
      // Como último recurso, recargar la página
      window.location.reload();
    }
  }

  async showErrorMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'bottom',
      color: 'danger',
    });
    toast.present();
  }

  // Modificar en PlanSelectionComponent
  async verifyPaymentStatus(transactionId: string) {
    const loading = await this.loadingController.create({
      message: 'Verificando estado del pago...',
      spinner: 'circular',
    });
    await loading.present();

    this.paymentService.verifyTransactionDetails(transactionId).subscribe({
      next: async (result) => {
        loading.dismiss();
        if (result.success) {
          // Más detalles en el mensaje de éxito
          this.showSuccessMessage(result.planName || 'Plan');
        } else {
          // Mensaje con más contexto
          this.showPendingMessage(result.statusMessage);
        }
      },
      error: async (error) => {
        console.error('Error verificando pago:', error);
        loading.dismiss();
        this.showErrorMessage(
          'Error al verificar el pago. Contacta a soporte si el problema persiste.'
        );
      },
    });
  }

  // Mensajes mejorados con más detalles
  async showSuccessMessage(planName: string) {
    const toast = await this.toastController.create({
      message: `¡Pago completado con éxito! Tu plan "${planName}" ha sido activado.`,
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
  }

  async showPendingMessage(statusMessage?: string) {
    const message =
      statusMessage ||
      'El pago no se completó o está pendiente de confirmación.';
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'bottom',
      color: 'warning',
    });
    toast.present();
  }
}

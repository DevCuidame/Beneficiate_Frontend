import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { Router } from '@angular/router';

import { Plan, PaymentService } from 'src/app/core/services/payment.service';
import { InlinePaymentComponent } from '../../../shared/components/inline-payment/inline-payment.component';
import { PlanSelectionService } from 'src/app/core/services/plan-selection.service';

@Component({
  selector: 'app-plan-card',
  imports: [CommonModule],
  templateUrl: './plan-card.component.html',
  styleUrls: ['./plan-card.component.scss'],
})
export class PlanCardComponent implements OnInit {
  @Input() imagen: string = '';
  @Input() titulo: string = '';
  @Input() precio: any = '';
  @Input() descripcion: string = '';
  @Input() botonTexto: string = 'Adquirir';
  @Input() customStyle: string = '';
  @Input() selectedPlanId: number | null = null;
  @Input() positionSide: any = { left: '0%' };
  @Input() optionClick: string = '';

  // Plan completo para guardarlo en el servicio
  @Input() planData: Plan | null = null;

  isDescriptionVisible = false;
  isLoading = false;
  isProcessing = false;

  constructor(
    private paymentService: PaymentService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController,
    private router: Router,
    private planSelectionService: PlanSelectionService
  ) {}

  ngOnInit(): void {}

  buttonOption() {
    if (this.optionClick === 'payment') {
      this.initiatePayment();
    } else if (this.optionClick === 'register') {
      this.savePlanAndNavigate();
    } else {
    }
  }

  savePlanAndNavigate() {
    if (!this.planData && this.selectedPlanId) {
      this.isLoading = true;
      this.paymentService.getPlans().subscribe({
        next: (plans) => {
          this.isLoading = false;
          let foundPlan: Plan | null = null;

          // Buscar el plan con el ID correspondiente
          if (Array.isArray(plans)) {
            foundPlan =
              plans.find((p) => p && p.id === this.selectedPlanId) || null;
          } else if (plans && typeof plans === 'object') {
            const plansArray = Object.values(plans as Record<string, Plan>);
            foundPlan =
              plansArray.find((p) => p && p.id === this.selectedPlanId) || null;
          }

          if (foundPlan) {
            // Guardar y navegar
            this.planSelectionService.setPlanSelection(foundPlan);
            this.router.navigate(['/desktop/register']);
          } else {
            this.showErrorMessage(
              'No se pudo identificar el plan seleccionado'
            );
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al obtener planes:', error);
          this.showErrorMessage('Error al procesar el plan seleccionado');
        },
      });
    } else if (this.planData) {
      // Si ya tenemos el plan completo, lo guardamos directamente
      this.planSelectionService.setPlanSelection(this.planData);
      this.router.navigate(['/desktop/register']);
    } else {
      // No hay plan seleccionado
      this.showErrorMessage('Por favor selecciona un plan');
    }
  }

  navigateToRegister() {
    this.savePlanAndNavigate();
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

    // Limpiar plan seleccionado en caso de error
    this.planSelectionService.clearPlanSelection();

    this.paymentService.initiatePayment(this.selectedPlanId).subscribe({
      next: async (paymentTransaction) => {
        loading.dismiss();
        this.isProcessing = false;

        // Limpiar la selección del plan en caso de error
        this.planSelectionService.clearPlanSelection();

        // Verificar si tenemos una URL de redirección
        if (!paymentTransaction.redirectUrl) {
          this.showErrorMessage('No se pudo obtener el enlace de pago');
          return;
        }

        try {
          // Informar al usuario que se abrirá una nueva pestaña
          const infoToast = await this.toastController.create({
            message:
              'El pago se abrirá en una nueva pestaña. Una vez completado, regresa a esta ventana.',
            duration: 5000,
            position: 'middle',
            color: 'info',
            buttons: [
              {
                text: 'OK',
                role: 'cancel',
              },
            ],
          });
          infoToast.present();

          // Procesar el pago - ahora usará nueva pestaña o modal según la plataforma
          const success = await this.paymentService.processPayment(
            paymentTransaction
          );

          // Limpiar plan seleccionado en caso de error
          this.planSelectionService.clearPlanSelection();

          if (success) {
            this.showSuccessMessage();
          } else {
            // Limpiar plan seleccionado en caso de error
            this.planSelectionService.clearPlanSelection();
            // Verificar una vez más por si acaso

            this.verifyPaymentStatus(paymentTransaction.transactionId);
          }
        } catch (error) {
          console.error('Error procesando el pago:', error);
          this.showErrorMessage('Hubo un problema con la pasarela de pago');
        }
      },
      error: async (error) => {
        console.error('Error iniciando pago:', error);
        loading.dismiss();
        // Limpiar la selección del plan en caso de error
        this.planSelectionService.clearPlanSelection();
        this.isProcessing = false;
        this.showErrorMessage('Error al iniciar el pago. Intenta de nuevo.');
      },
    });
  }

  async showSuccessMessage() {
    // Aseguramos que el plan se haya borrado
    this.planSelectionService.clearPlanSelection();

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
          },
        },
      ],
    });
    toast.present();
  }

  async showPendingMessage() {
    // Aseguramos que el plan se haya borrado
    this.planSelectionService.clearPlanSelection();

    const toast = await this.toastController.create({
      message:
        'El pago no se completó o está pendiente de confirmación. Puedes cerrar la pestaña de pago.',
      duration: 4000,
      position: 'bottom',
      color: 'warning',
    });
    toast.present();
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

  async verifyPaymentStatus(transactionId: string) {
    const loading = await this.loadingController.create({
      message: 'Verificando estado del pago...',
      spinner: 'circular',
    });
    await loading.present();

    this.paymentService.verifyTransaction(transactionId).subscribe({
      next: async (success) => {
        loading.dismiss();
        // Limpiar la selección del plan en caso de error
        this.planSelectionService.clearPlanSelection();
        if (success) {
          this.showSuccessMessage();
        } else {
          this.showPendingMessage();
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

  openDescription() {
    this.isDescriptionVisible = !this.isDescriptionVisible;
  }
}

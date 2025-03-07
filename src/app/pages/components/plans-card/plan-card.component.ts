import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { Plan, PaymentService } from 'src/app/core/services/payment.service';
import { InlinePaymentComponent } from '../../../shared/components/inline-payment/inline-payment.component';

@Component({
  selector: 'app-plan-card',
  imports: [CommonModule],
  templateUrl: './plan-card.component.html',
  styleUrls: ['./plan-card.component.scss'],
})
export class PlanCardComponent implements OnInit {
  @Input() imagen: string = '';
  @Input() titulo: string = '';
  @Input() precio: string = '';
  @Input() descripcion: string = '';
  @Input() botonTexto: string = 'Adquirir';
  @Input() customStyle: string = '';
  @Input() selectedPlanId: number | null = null;
  @Input() positionSide: any = { left: '0%' };
  @Input() optionClick: string = '';

  isDescriptionVisible = false;
  isLoading = false;
  isProcessing = false;

  constructor(
    private paymentService: PaymentService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log(this.optionClick);
  }

  buttonOption() {
    if (this.optionClick === 'payment') {
      this.initiatePayment();
    } else if (this.optionClick === 'register') {
      this.navigateToRegister();
    } else {
      console.log('No se ha especificado una opción válida');
    }
  }

  navigateToRegister() {
    console.log('asdasd');
    this.router.navigate(['/desktop/register']);
  }

  async initiatePayment() {
    if (!this.selectedPlanId) {
      const toast = await this.toastController.create({
        message: 'Por favor selecciona un plan.',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      toast.present();
      return;
    }

    this.isProcessing = true;
    const loading = await this.loadingController.create({
      message: 'Iniciando proceso de pago...',
      spinner: 'circular'
    });
    await loading.present();

    this.paymentService.initiatePayment(this.selectedPlanId).subscribe({
      next: async (paymentTransaction) => {
        loading.dismiss();
        this.isProcessing = false;

        console.log('Transaction data:', paymentTransaction);

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
            this.showSuccessMessage();
          } else {
            // Verificar una vez más por si acaso se cerró el modal manualmente
            this.verifyPaymentStatus(paymentTransaction.transactionId);
          }
        } catch (error) {
          console.error('Error mostrando el modal de pago:', error);
          this.showErrorMessage('Hubo un problema con la pasarela de pago');
        }
      },
      error: async (error) => {
        console.error('Error iniciando pago:', error);
        loading.dismiss();
        this.isProcessing = false;
        this.showErrorMessage('Error al iniciar el pago. Intenta de nuevo.');
      }
    });
  }

  async showSuccessMessage() {
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
  }

  async showPendingMessage() {
    const toast = await this.toastController.create({
      message: 'El pago no se completó o está pendiente de confirmación.',
      duration: 4000,
      position: 'bottom',
      color: 'warning'
    });
    toast.present();
  }

  async showErrorMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
  }

  async verifyPaymentStatus(transactionId: string) {
    const loading = await this.loadingController.create({
      message: 'Verificando estado del pago...',
      spinner: 'circular'
    });
    await loading.present();

    this.paymentService.verifyTransaction(transactionId).subscribe({
      next: async (success) => {
        loading.dismiss();
        if (success) {
          this.showSuccessMessage();
        } else {
          this.showPendingMessage();
        }
      },
      error: async (error) => {
        console.error('Error verificando pago:', error);
        loading.dismiss();
        this.showErrorMessage('Error al verificar el pago. Contacta a soporte si el problema persiste.');
      }
    });
  }

  openDescription() {
    this.isDescriptionVisible = !this.isDescriptionVisible;
  }
}

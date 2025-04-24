import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PaymentVerificationService } from 'src/app/core/services/payment-verification.service';

@Component({
  selector: 'app-payment-verifier',
  template: '', // Componente invisible, solo lógica
})
export class PaymentVerifierComponent implements OnInit, OnDestroy {
  private paymentCompletedSubscription: Subscription | null = null;

  constructor(
    private paymentVerificationService: PaymentVerificationService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Verificar pagos pendientes al cargar el componente
    this.verifyPendingPayments();

    // Suscribirse a notificaciones de pagos completados
    this.paymentCompletedSubscription = this.paymentVerificationService.paymentCompleted$.subscribe(
      (transactionId) => {
        if (transactionId) {
          this.showSuccessMessage();
        }
      }
    );

    // Configurar verificación cuando el usuario regresa a la página
    this.setupVisibilityListener();
  }

  ngOnDestroy() {
    // Limpiar suscripción
    if (this.paymentCompletedSubscription) {
      this.paymentCompletedSubscription.unsubscribe();
    }
    
    // Eliminar el listener del evento visibilitychange
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Configura un listener para cuando el usuario vuelve a la pestaña
   */
  private setupVisibilityListener() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Maneja el evento de cambio de visibilidad del documento
   */
  private handleVisibilityChange = () => {
    // Verificar cuando el usuario vuelve a la pestaña
    if (document.visibilityState === 'visible') {
      this.verifyPendingPayments();
    }
  };

  /**
   * Verifica si hay pagos pendientes
   */
  private verifyPendingPayments() {
    this.paymentVerificationService.verifyPendingTransactions().subscribe(
      (success) => {
        if (success) {
          // La notificación se maneja a través de la suscripción a paymentCompleted$
          console.log('Pago completado verificado automáticamente');
        }
      }
    );
  }

  /**
   * Muestra un mensaje de éxito
   */
  private async showSuccessMessage() {
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
}
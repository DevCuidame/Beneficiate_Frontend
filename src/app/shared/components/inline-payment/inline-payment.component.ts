import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonicModule, ModalController } from '@ionic/angular';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-inline-payment',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Procesar Pago</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="iframe-container">
        <iframe
          *ngIf="safeUrl"
          [src]="safeUrl"
          frameborder="0"
          allow="accelerometer; autoplay; camera; gyroscope; payment"
          class="payment-frame"
          (load)="onIframeLoad()"
          (error)="onIframeError()"
        ></iframe>
        <div *ngIf="!safeUrl" class="loading-container">
          <ion-spinner name="circular"></ion-spinner>
          <p>Cargando pasarela de pago...</p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .iframe-container {
        height: 100%;
        width: 100%;
        overflow: hidden;
        position: relative;
      }
      .payment-frame {
        height: 100%;
        width: 100%;
        border: none;
        overflow: hidden;
        background-color: #f5f5f5;
      }
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      .loading-container p {
        margin-top: 1rem;
        color: var(--ion-color-medium);
      }
    `,
  ],
})
export class InlinePaymentComponent implements OnInit, OnDestroy {
  @Input() paymentUrl!: string;
  @Input() transactionId!: string;
  @Output() paymentComplete = new EventEmitter<{
    success: boolean;
    planId?: number;
    planName?: string;
  }>();

  safeUrl: SafeResourceUrl | null = null;
  checkInterval: any;

  constructor(
    private sanitizer: DomSanitizer,
    private modalController: ModalController,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    if (this.paymentUrl) {
      // Añadir parámetros para evitar caché y problemas de CSP
      const urlWithParams = `${this.paymentUrl}?_=${Date.now()}`;
      this.safeUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(urlWithParams);
      this.startPaymentMonitoring();
    }
  }

  ngOnDestroy() {
    this.clearCheckInterval();
  }

  onIframeLoad() {
    setTimeout(() => {
      this.checkTransactionOnce();
    }, 3000);
  }

  onIframeError() {
    // Verificar el estado inmediatamente si el iframe falla
    this.checkTransactionOnce();
  }

  private checkTransactionOnce() {
    if (this.transactionId) {
      this.paymentService
        .verifyTransactionDetails(this.transactionId)
        .subscribe({
          next: (result) => {
            if (result.success) {
              this.paymentComplete.emit({
                success: true,
                planId: result.planId,
                planName: result.planName,
              });
              this.dismiss(true, result);
            }
          },
        });
    }
  }

  private startPaymentMonitoring() {
    if (this.transactionId) {

      // Crear un intervalo para verificar periódicamente el estado de la transacción
      this.checkInterval = setInterval(() => {
        this.paymentService
          .verifyTransactionDetails(this.transactionId)
          .subscribe({
            next: (result) => {

              if (result.success) {
                // Modificar el tipo de EventEmitter para aceptar un objeto
                this.paymentComplete.emit({
                  success: true,
                  planId: result.planId,
                  planName: result.planName,
                });
                this.dismiss(true, result);
                clearInterval(this.checkInterval);
              }
            },
            error: (error) => {
              console.error('Error verificando transacción:', error);
            },
          });
      }, 5000); // Verificar cada 5 segundos
    }
  }

  // Actualizar el método dismiss para incluir detalles
  dismiss(success: boolean = false, details?: any) {
    this.clearCheckInterval();
    this.modalController.dismiss({ success, details });
  }

  // private async checkTransactionStatus(transactionId: string) {
  //   try {
  //     // Importar dinámicamente para evitar dependencias circulares
  //     const { PaymentService } = await import(
  //       '../../../core/services/payment.service'
  //     );
  //     const paymentService = new PaymentService(null as any, null as any); // No es ideal, pero funciona para este caso

  //     paymentService.verifyTransaction(transactionId).subscribe({
  //       next: (success) => {
  //         if (reuslsuccess) {
  //           this.paymentComplete.emit({
  //             success: true,
  //             planId: result.planId,
  //             planName: result.planName
  //           });
  //           this.dismiss(true);
  //         }
  //       },
  //       error: (err) => console.error('Error verificando transacción:', err),
  //     });
  //   } catch (error) {
  //     console.error('Error checking transaction status', error);
  //   }
  // }

  private clearCheckInterval() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

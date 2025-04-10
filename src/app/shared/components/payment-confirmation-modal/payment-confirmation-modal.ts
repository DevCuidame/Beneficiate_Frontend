import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { IonicModule, ModalController } from "@ionic/angular";
import { PaymentService } from "src/app/core/services/payment.service";
import { PaymentStatusComponent } from "../payment-status/payment-status.component";

@Component({
    selector: 'app-payment-confirmation-modal',
    imports: [CommonModule, IonicModule, PaymentStatusComponent],
    template: `
      <ion-content class="ion-padding">
        <app-payment-status [status]="paymentStatus">
          <ion-button expand="block" (click)="checkStatus()">
            Verificar estado
          </ion-button>
          <ion-button expand="block" color="medium" (click)="dismiss()">
            Cerrar
          </ion-button>
        </app-payment-status>
      </ion-content>
    `
  })
  export class PaymentConfirmationModalComponent implements OnInit {
    @Input() transactionId!: string;
    paymentStatus: 'success' | 'pending' | 'error' = 'pending';
    
    constructor(
      private paymentService: PaymentService,
      private modalCtrl: ModalController
    ) {}
    
    ngOnInit() {
      this.checkStatus();
      
      // Verificar automáticamente cada 5 segundos
      const interval = setInterval(() => {
        this.checkStatus();
      }, 5000);
      
      // Limpiar el intervalo cuando se cierre el modal
      this.modalCtrl.dismiss().then(() => {
        clearInterval(interval);
      });
    }
    
    checkStatus() {
      this.paymentService.verifyTransactionDetails(this.transactionId).subscribe({
        next: (result) => {
          if (result.success) {
            this.paymentStatus = 'success';
            // Recargar datos después de un tiempo
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          } else {
            this.paymentStatus = 'pending';
          }
        },
        error: () => {
          this.paymentStatus = 'error';
        }
      });
    }
    
    dismiss() {
      this.modalCtrl.dismiss();
    }
  }
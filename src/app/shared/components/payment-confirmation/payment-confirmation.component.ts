// payment-confirmation.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-payment-confirmation',
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Confirmación de Pago</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div *ngIf="isLoading" class="loading-container">
        <ion-spinner name="circular"></ion-spinner>
        <h3>Verificando tu pago...</h3>
      </div>
      
      <div *ngIf="!isLoading && paymentSuccessful" class="success-container">
        <ion-icon name="checkmark-circle" color="success" size="large"></ion-icon>
        <h2>¡Pago Exitoso!</h2>
        <p>Tu plan <strong>{{ planName }}</strong> ha sido activado correctamente.</p>
        <p>Ahora puedes disfrutar de todos los beneficios de tu suscripción.</p>
        
        <ion-button expand="block" (click)="navigateToHome()">
          Continuar a Mi Cuenta
        </ion-button>
      </div>
      
      <div *ngIf="!isLoading && !paymentSuccessful" class="error-container">
        <ion-icon name="alert-circle" color="warning" size="large"></ion-icon>
        <h2>Estado del Pago</h2>
        <p>{{ statusMessage }}</p>
        
        <ion-button expand="block" (click)="checkAgain()">
          Verificar Nuevamente
        </ion-button>
        
        <ion-button expand="block" fill="outline" (click)="navigateToHome()">
          Volver a Mi Cuenta
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-container, .success-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 100%;
    }
    
    ion-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    
    h2 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    
    p {
      margin-bottom: 20px;
      font-size: 16px;
      color: var(--ion-color-medium);
    }
    
    ion-button {
      margin-top: 20px;
    }
  `]
})
export class PaymentConfirmationComponent implements OnInit {
  transactionId: string = '';
  isLoading: boolean = true;
  paymentSuccessful: boolean = false;
  planName: string = '';
  statusMessage: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.transactionId = params['id'];
      if (this.transactionId) {
        this.verifyTransaction();
      } else {
        this.isLoading = false;
        this.paymentSuccessful = false;
        this.statusMessage = 'No se proporcionó un ID de transacción válido.';
      }
    });
  }
  
  async verifyTransaction() {
    this.isLoading = true;
    
    this.paymentService.verifyTransactionDetails(this.transactionId).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.paymentSuccessful = result.success;
        this.planName = result.planName || 'Premium';
        this.statusMessage = result.statusMessage || 
          (result.success ? 'Pago procesado correctamente' : 'El pago está pendiente o no fue aprobado');
      },
      error: (error) => {
        console.error('Error verificando transacción:', error);
        this.isLoading = false;
        this.paymentSuccessful = false;
        this.statusMessage = 'Error al verificar el estado del pago. Por favor contacta a soporte.';
      }
    });
  }
  
  checkAgain() {
    this.verifyTransaction();
  }
  
  navigateToHome() {
    this.router.navigate(['/dashboard']);
  }
}
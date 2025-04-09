// payment-status.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <div class="status-container" [ngClass]="statusClass">
      <ion-icon [name]="statusIcon" [color]="statusColor"></ion-icon>
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .status-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }
    
    ion-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    h2 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      color: var(--ion-color-medium);
      margin-bottom: 1.5rem;
    }
    
    .success {
      background-color: rgba(45, 211, 111, 0.1);
    }
    
    .pending {
      background-color: rgba(255, 196, 9, 0.1);
    }
    
    .error {
      background-color: rgba(235, 68, 90, 0.1);
    }
  `]
})
export class PaymentStatusComponent implements OnInit {
  @Input() status: 'success' | 'pending' | 'error' = 'pending';
  
  statusIcon = 'hourglass-outline';
  statusColor = 'warning';
  statusClass = 'pending';
  title = 'Procesando Pago';
  message = 'Tu pago está siendo procesado...';
  
  ngOnInit() {
    this.updateStatus();
  }
  
  ngOnChanges() {
    this.updateStatus();
  }
  
  private updateStatus() {
    switch (this.status) {
      case 'success':
        this.statusIcon = 'checkmark-circle-outline';
        this.statusColor = 'success';
        this.statusClass = 'success';
        this.title = '¡Pago Exitoso!';
        this.message = 'Tu plan ha sido activado correctamente.';
        break;
      case 'error':
        this.statusIcon = 'alert-circle-outline';
        this.statusColor = 'danger';
        this.statusClass = 'error';
        this.title = 'Error en el Pago';
        this.message = 'Ha ocurrido un problema al procesar tu pago.';
        break;
      case 'pending':
      default:
        this.statusIcon = 'hourglass-outline';
        this.statusColor = 'warning';
        this.statusClass = 'pending';
        this.title = 'Procesando Pago';
        this.message = 'Tu pago está siendo procesado...';
        break;
    }
  }
}
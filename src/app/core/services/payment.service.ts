import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Plan {
  id: number;
  name: string;
  code?: string;
  description: string;
  price: number;
  duration_days: number;
  max_beneficiaries: number;
  is_active: boolean;
  created_at: string;
}

export interface PaymentTransaction {
  transactionId: string;
  publicKey: string;
  redirectUrl: string;
}

export interface PaymentHistory {
  id: number;
  user_id: number;
  plan_id: number;
  amount: number;
  payment_method: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  plan_name: string;
  plan_description: string;
}

// Interfaz para manejar la estructura de respuesta de tu API
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = environment.url || 'http://localhost:3000/api/v1';
  private isNativePlatform: boolean = false;
  private paymentTab: Window | null = null;
  private checkIntervalId: any = null;

  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private platform: Platform
  ) {
    // Determinar si estamos en una plataforma nativa o en un navegador
    this.isNativePlatform = this.platform.is('cordova') || 
                            this.platform.is('capacitor') || 
                            this.platform.is('ios') || 
                            this.platform.is('android');
  }

  /**
   * Obtiene todos los planes disponibles
   */
  getPlans(): Observable<Plan[]> {
    return this.http
      .get<ApiResponse<Plan[]> | Plan[]>(`${this.baseUrl}api/v1/plans/all`)
      .pipe(
        map((response) => {
          // Verificar si la respuesta tiene la estructura esperada
          if (response && typeof response === 'object' && 'data' in response) {
            // Es un ApiResponse
            return (response as ApiResponse<Plan[]>).data;
          } else {
            // Es directamente un array
            return response as Plan[];
          }
        }),
        catchError((error) => {
          console.error('Error obteniendo planes:', error);
          return throwError(
            () => new Error('No se pudieron cargar los planes')
          );
        })
      );
  }

  /**
   * Procesa el pago según la plataforma: 
   * - En navegador: abre nueva pestaña
   * - En app nativa: usa modal
   */
  async processPayment(paymentTransaction: PaymentTransaction): Promise<boolean> {
    if (this.isNativePlatform) {
      // En plataforma nativa, usar modal
      return await this.openInlinePayment(paymentTransaction);
    } else {
      // En navegador, abrir en nueva pestaña
      return await this.openNewTabPayment(paymentTransaction);
    }
  }

  /**
   * Abre la página de pago de Wompi dentro de un modal en vez de una ventana emergente
   * (Usar preferentemente en aplicaciones nativas)
   */
  async openInlinePayment(
    paymentTransaction: PaymentTransaction
  ): Promise<boolean> {
    // Importar el componente dinámicamente para evitar dependencias circulares
    const { InlinePaymentComponent } = await import(
      '../../shared/components/inline-payment/inline-payment.component'
    );

    const modal = await this.modalController.create({
      component: InlinePaymentComponent,
      componentProps: {
        paymentUrl: paymentTransaction.redirectUrl,
        transactionId: paymentTransaction.transactionId
      },
      cssClass: 'payment-modal',
      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    return data?.success || false;
  }

  /**
   * Abre el pago en una nueva pestaña (no popup) y monitorea cuando se completa
   * (Mejor para navegadores web)
   */
  async openNewTabPayment(paymentTransaction: PaymentTransaction): Promise<boolean> {
    return new Promise((resolve) => {
      // Abrimos en nueva pestaña con target="_blank"
      this.paymentTab = window.open(
        paymentTransaction.redirectUrl,
        '_blank'
      );

      // Verificar si se pudo abrir la pestaña
      if (!this.paymentTab) {
        console.error('No se pudo abrir la nueva pestaña. Verifica que no esté bloqueada.');
        resolve(false);
        return;
      }

      // Intervalo para verificar el estado del pago
      this.checkIntervalId = setInterval(() => {
        this.verifyTransactionDetails(paymentTransaction.transactionId).subscribe({
          next: (result) => {
            if (result.success) {
              // Pago exitoso, limpiar intervalo
              this.clearCheckInterval();
              resolve(true);
              
              // Notificamos al usuario que puede cerrar la pestaña de pago
              // (No podemos cerrarla automáticamente por seguridad del navegador)
            }
          },
          error: () => {
            // Continuar verificando
          }
        });
      }, 3000);

      // Por seguridad, establecer un tiempo máximo de espera (5 minutos)
      setTimeout(() => {
        this.clearCheckInterval();
        
        // Verificar una última vez antes de resolver
        this.verifyTransactionDetails(paymentTransaction.transactionId).subscribe({
          next: (result) => {
            resolve(result.success);
          },
          error: () => {
            resolve(false);
          }
        });
      }, 300000); // 5 minutos
    });
  }

  /**
   * Limpia el intervalo de verificación
   */
  private clearCheckInterval(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  /**
   * Verifica el estado detallado de una transacción
   */
  verifyTransactionDetails(transactionId: string): Observable<{
    success: boolean;
    planId?: number;
    planName?: string;
    planDescription?: string;
    statusMessage?: string;
  }> {
    return this.http
      .get<any>(
        `${this.baseUrl}api/v1/payments/verify-details/${transactionId}`
      )
      .pipe(
        map((response) => {
          if (response && typeof response === 'object' && 'data' in response) {
            return (response as ApiResponse<any>).data;
          } else {
            return response;
          }
        }),
        catchError((error) => {
          console.error('Error verificando detalles de transacción:', error);
          // Retornar un objeto con información del error
          return of({
            success: false,
            statusMessage: 'Error de conexión al verificar el pago',
          });
        })
      );
  }

  /**
   * Inicia una transacción de pago con Wompi
   */
  initiatePayment(planId: number): Observable<PaymentTransaction> {
    return this.http
      .post<ApiResponse<PaymentTransaction> | PaymentTransaction>(
        `${this.baseUrl}api/v1/payments/create`,
        { planId }
      )
      .pipe(
        map((response) => {
          if (response && typeof response === 'object' && 'data' in response) {
            return (response as ApiResponse<PaymentTransaction>).data;
          } else {
            return response as PaymentTransaction;
          }
        }),
        catchError((error) => {
          console.error('Error iniciando pago:', error);
          return throwError(() => new Error('No se pudo iniciar el pago'));
        })
      );
  }

  verifyTransaction(transactionId: string): Observable<boolean> {
    return this.http
      .get<ApiResponse<{ success: boolean }> | { success: boolean }>(
        `${this.baseUrl}api/v1/payments/verify/${transactionId}`
      )
      .pipe(
        map((response) => {
          if (response && typeof response === 'object' && 'data' in response) {
            return (response as ApiResponse<{ success: boolean }>).data.success;
          } else {
            return (response as { success: boolean }).success;
          }
        }),
        catchError((error) => {
          console.error('Error verificando transacción:', error);
          // En caso de error de conexión, intentar usar el nuevo endpoint
          return this.verifyTransactionDetails(transactionId).pipe(
            map((details) => details.success)
          );
        })
      );
  }

  /**
   * Obtiene el historial de pagos del usuario
   */
  getPaymentHistory(): Observable<PaymentHistory[]> {
    return this.http
      .get<ApiResponse<PaymentHistory[]> | PaymentHistory[]>(
        `${this.baseUrl}api/v1/payments/history`
      )
      .pipe(
        map((response) => {
          if (response && typeof response === 'object' && 'data' in response) {
            return (response as ApiResponse<PaymentHistory[]>).data;
          } else {
            return response as PaymentHistory[];
          }
        }),
        catchError((error) => {
          console.error('Error obteniendo historial de pagos:', error);
          return throwError(
            () => new Error('No se pudo obtener el historial de pagos')
          );
        })
      );
  }
}
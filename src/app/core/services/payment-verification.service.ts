import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PaymentService } from './payment.service';

interface PendingPayment {
  transactionId: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentVerificationService {
  private baseUrl = environment.url || 'http://localhost:3000/api/v1';
  private pendingTransactionsKey = 'pending_transactions';
  private verificationInProgress = false;
  
  // Observable para informar a los componentes cuando se completa un pago
  private paymentCompletedSource = new BehaviorSubject<string | null>(null);
  public paymentCompleted$ = this.paymentCompletedSource.asObservable();

  constructor(
    private http: HttpClient,
    private paymentService: PaymentService
  ) {}

  /**
   * Guarda una transacción pendiente para verificarla después
   */
  public savePendingTransaction(transactionId: string): void {
    try {
      // Obtener transacciones pendientes existentes
      const pendingTransactions = this.getPendingTransactions();
      
      // Añadir la nueva transacción con timestamp
      pendingTransactions.push({
        transactionId,
        timestamp: Date.now()
      });
      
      // Guardar en localStorage
      localStorage.setItem(
        this.pendingTransactionsKey, 
        JSON.stringify(pendingTransactions)
      );
    } catch (error) {
      console.error('Error guardando transacción pendiente:', error);
    }
  }

  /**
   * Obtiene todas las transacciones pendientes del localStorage
   */
  private getPendingTransactions(): PendingPayment[] {
    try {
      const stored = localStorage.getItem(this.pendingTransactionsKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error obteniendo transacciones pendientes:', error);
      return [];
    }
  }

  /**
   * Elimina una transacción de las pendientes
   */
  private removePendingTransaction(transactionId: string): void {
    try {
      const pendingTransactions = this.getPendingTransactions();
      const updated = pendingTransactions.filter(
        t => t.transactionId !== transactionId
      );
      localStorage.setItem(
        this.pendingTransactionsKey,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Error eliminando transacción pendiente:', error);
    }
  }

  /**
   * Verifica todas las transacciones pendientes almacenadas
   * Retorna true si al menos una transacción fue aprobada
   */
  public verifyPendingTransactions(): Observable<boolean> {
    // Evitar verificaciones simultáneas
    if (this.verificationInProgress) {
      return of(false);
    }

    const pendingTransactions = this.getPendingTransactions();
    
    // Si no hay transacciones pendientes, retornar false
    if (pendingTransactions.length === 0) {
      return of(false);
    }
    
    this.verificationInProgress = true;
    
    // Filtra transacciones más recientes que 24 horas (86400000 ms)
    const recentTransactions = pendingTransactions.filter(
      t => (Date.now() - t.timestamp) < 86400000
    );
    
    // Si el filtro eliminó algunas, actualizar el localStorage
    if (recentTransactions.length < pendingTransactions.length) {
      localStorage.setItem(
        this.pendingTransactionsKey,
        JSON.stringify(recentTransactions)
      );
    }
    
    // Si no hay transacciones recientes después de filtrar
    if (recentTransactions.length === 0) {
      this.verificationInProgress = false;
      return of(false);
    }
    
    // Verificar la primera transacción pendiente (podríamos hacer todas, pero para optimizar recursos)
    const transaction = recentTransactions[0];
    
    return this.paymentService.verifyTransactionDetails(transaction.transactionId).pipe(
      tap(result => {
        // Si la transacción fue exitosa, eliminarla de pendientes
        if (result.success) {
          this.removePendingTransaction(transaction.transactionId);
          // Notificar a los componentes que observan
          this.paymentCompletedSource.next(transaction.transactionId);
        }
        this.verificationInProgress = false;
      }),
      map(result => result.success),
      catchError(error => {
        console.error('Error verificando transacción pendiente:', error);
        this.verificationInProgress = false;
        return of(false);
      })
    );
  }

  /**
   * Limpia todas las transacciones pendientes (útil después de iniciar sesión)
   */
  public clearPendingTransactions(): void {
    localStorage.removeItem(this.pendingTransactionsKey);
  }
}
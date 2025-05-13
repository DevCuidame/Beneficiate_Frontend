import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Plan } from 'src/app/core/services/payment.service';

@Injectable({
  providedIn: 'root'
})
export class PlanSelectionService {
  private selectedPlanSource = new BehaviorSubject<Plan | null>(null);
  
  public selectedPlan$: Observable<Plan | null> = this.selectedPlanSource.asObservable();
  
  private hasPlanSelectedSource = new BehaviorSubject<boolean>(false);
  public hasPlanSelected$: Observable<boolean> = this.hasPlanSelectedSource.asObservable();

  constructor() {
    setTimeout(() => {
      this.checkStoredPlan();
    }, 0);
  }

  /**
   * Establece el plan seleccionado
   */
  setPlanSelection(plan: Plan): void {
    if (!plan) return;

    try {
      // Guardar en sessionStorage para persistencia entre navegaciones
      sessionStorage.setItem('selectedPlan', JSON.stringify(plan));
      
      // Actualizar los BehaviorSubjects
      this.selectedPlanSource.next(plan);
      this.hasPlanSelectedSource.next(true);
      
    } catch (error) {
      console.error('Error al guardar el plan:', error);
    }
  }

  /**
   * Obtiene el plan seleccionado actual
   */
  getSelectedPlan(): Plan | null {
    const storedPlan = sessionStorage.getItem('selectedPlan');
    
    if (storedPlan) {
      try {
        return JSON.parse(storedPlan) as Plan;
      } catch (e) {
        console.error('Error al recuperar el plan guardado:', e);
        return null;
      }
    }
    
    return this.selectedPlanSource.value;
  }

  /**
   * Verifica si hay un plan seleccionado
   */
  hasPlanSelected(): boolean {
    return this.hasPlanSelectedSource.value || sessionStorage.getItem('selectedPlan') !== null;
  }

  /**
   * Limpia la selección del plan
   */
  clearPlanSelection(): void {
    sessionStorage.removeItem('selectedPlan');
    this.selectedPlanSource.next(null);
    this.hasPlanSelectedSource.next(false);
  }

  /**
   * Fuerza una actualización manual desde sessionStorage
   */
  forceRefreshFromStorage(): void {
    this.checkStoredPlan();
  }

  /**
   * Verifica si hay un plan guardado en sessionStorage
   */
  private checkStoredPlan(): void {
    try {
      const storedPlan = sessionStorage.getItem('selectedPlan');
      
      if (storedPlan) {
        try {
          const plan = JSON.parse(storedPlan) as Plan;
          
          this.selectedPlanSource.next(plan);
          this.hasPlanSelectedSource.next(true);
        } catch (e) {
          sessionStorage.removeItem('selectedPlan');
        }
      } else {
      }
    } catch (error) {
      console.error('Error al verificar el plan en sessionStorage:', error);
    }
  }
}
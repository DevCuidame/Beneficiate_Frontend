import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wizard-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stepper" [class.schedule-assignment-mode]="isScheduleAssignment">
      <div class="steps">
        <!-- En modo de asignación de horario, solo mostramos el paso 4 -->
        @if (!isScheduleAssignment) {
          <div class="step" [class.active]="currentStep >= 1">
            <div class="circle" [class.completed]="currentStep > 1"></div>
            <div class="step-name">DATOS</div>
          </div>
          <div class="step" [class.active]="currentStep >= 2">
            <div class="circle" [class.completed]="currentStep > 2"></div>
            <div class="step-name">ESPECIALIDAD</div>
          </div>
          <div class="step" [class.active]="currentStep >= 3">
            <div class="circle" [class.completed]="currentStep > 3"></div>
            <div class="step-name">PROFESIONAL</div>
          </div>
          <div class="step" [class.active]="currentStep >= 4">
            <div class="circle" [class.completed]="currentStep > 4"></div>
            <div class="step-name">FECHA Y HORA</div>
          </div>
        } @else {
          <!-- Para asignación de horario, mostramos un título acorde -->
          <div class="schedule-assignment-title">
            <h2>Asignación de Horario para Cita Pendiente</h2>
            <p>Seleccione una fecha y hora disponible para confirmar la cita</p>
          </div>
        }
      </div>
      <div class="step-line" [class.hidden]="isScheduleAssignment"></div>
    </div>
  `,
  styles: [`
    .stepper {
      position: relative;
      margin-bottom: 2rem;
      padding-bottom: 20px;
    }

    .steps {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: var(--ion-color-secondary);
      transition: background-color 0.3s;
    }

    .step.active .circle {
      background-color: #28a745;
    }

    .step.active.completed .circle {
      background-color: #28a745;
    }

    .step-name {
      margin-top: 8px;
      font-size: 1.1rem;
      color: var(--ion-color-dark);
      font-weight: bold;
      text-align: center;
    }

    .step-line {
      position: absolute;
      top: 9px;
      left: calc(100% / 8);
      right: calc(100% / 8);
      height: 3px;
      background-color: var(--ion-color-secondary);
      z-index: 1;
    }
    
    .step-line.hidden {
      display: none;
    }
    
    /* Estilos para el modo de asignación de horario */
    .schedule-assignment-mode .steps {
      justify-content: center;
    }
    
    .schedule-assignment-title {
      text-align: center;
      width: 100%;
      
      h2 {
        color: var(--ion-color-dark);
        margin-bottom: 0.5rem;
      }
      
      p {
        color: var(--ion-color-medium);
        font-size: 1rem;
        margin: 0;
      }
    }
  `]
})
export class WizardStepperComponent {
  @Input() currentStep: number = 1;
  @Input() isScheduleAssignment: boolean = false;
}
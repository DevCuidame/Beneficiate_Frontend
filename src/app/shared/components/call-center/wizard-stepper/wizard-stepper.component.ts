import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wizard-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stepper">
      <div class="steps">
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
      </div>
      <div class="step-line"></div>
    </div>
  `,
  styleUrls: ['./wizard-stepper.component.scss']
})
export class WizardStepperComponent {
  @Input() currentStep: number = 1;
}
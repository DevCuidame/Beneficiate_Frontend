import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from 'src/app/core/services/toast.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { PatientDataStepComponent } from '../patient-data-step/patient-data-step.component';
import { SpecialtySelectionStepComponent } from '../specialty-selection-step/specialty-selection-step.component';
import { ProfessionalSelectionStepComponent } from '../professional-selection-step/professional-selection-step.component';
import { ScheduleSelectionStepComponent } from '../schedule-selection-step/schedule-selection-step.component';
import { AppointmentAssignedComponent } from '../appointment-assigned/appointment-assigned.component';
import { WizardStepperComponent } from '../wizard-stepper/wizard-stepper.component';
import { AppointmentStateService } from 'src/app/core/services/appointment-state.service';

@Component({
  selector: 'app-appointment-wizard',
  standalone: true,
  imports: [
    CommonModule,
    PatientDataStepComponent,
    SpecialtySelectionStepComponent,
    ProfessionalSelectionStepComponent,
    ScheduleSelectionStepComponent,
    AppointmentAssignedComponent,
    WizardStepperComponent
  ],
  template: `
    @if(!success()) {
      <div class="wizard-container">
        <!-- Componente de stepper -->
        <app-wizard-stepper [currentStep]="currentStep()"></app-wizard-stepper>

        <!-- Contenido de los pasos -->
        <div class="wizard-content">
          @if (currentStep() === 1) {
            <app-patient-data-step></app-patient-data-step>
          } @else if (currentStep() === 2) {
            <app-specialty-selection-step></app-specialty-selection-step>
          } @else if (currentStep() === 3) {
            <app-professional-selection-step></app-professional-selection-step>
          } @else if (currentStep() === 4) {
            <app-schedule-selection-step></app-schedule-selection-step>
          }
        </div>

        <!-- Botones de navegación -->
        <div class="buttons-container">
          <button
            class="prev-button"
            (click)="prevStep()"
            [disabled]="currentStep() === 1 || isSubmitting()"
          >
            Anterior
          </button>
          <button
            class="next-button"
            (click)="nextStep()"
            [disabled]="!isStepValid() || isSubmitting()"
          >
            <span *ngIf="!(currentStep() === 4 && isSubmitting())">
              {{ currentStep() < 4 ? "Siguiente" : "Confirmar" }}
            </span>
            <span *ngIf="currentStep() === 4 && isSubmitting()" class="button-loading">
              <i class="fas fa-spinner fa-spin"></i> Procesando...
            </span>
          </button>
        </div>
      </div>
    } @else {
      <app-appointment-assigned
        [isPending]="false"
        [patientName]="getFullName()"
        [professionalName]="getSelectedProfessionalName()"
        [specialty]="getSelectedSpecialty()"
        [date]="appointment().appointment_date"
        [time]="appointment().appointment_time"
        [dayOfWeek]="getFormattedDayOfWeek()"
      ></app-appointment-assigned>
    }
  `,
  styleUrls: ['./appointment-wizard.component.scss']
})
export class AppointmentWizardComponent implements OnInit {
  public currentStep = this.stateService.currentStep;
  public isSubmitting = this.stateService.isSubmitting;
  public success = this.stateService.success;
  public appointment = this.stateService.appointment;
  
  constructor(
    private stateService: AppointmentStateService,
    private appointmentService: AppointmentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Si hay datos de navegación, cargarlos en el estado
    const navData = history.state.appointment;
    if (navData) {
      this.stateService.appointment.set(navData);
      localStorage.setItem('selectedAppointment', JSON.stringify(navData));
    }
  }

  nextStep(): void {
    if (this.isStepValid()) {
      // Actualizar los datos de la cita según el paso actual
      this.stateService.updateAppointmentForStep();
      
      if (this.currentStep() < 4) {
        this.stateService.nextStep();
      } else {
        // Procesar la confirmación de la cita
        this.stateService.setSubmitting(true);
        this.sendAppointmentData();
      }
    } else {
      this.toastService.presentToast(
        'Por favor, complete todos los campos antes de continuar.',
        'warning'
      );
    }
  }

  prevStep(): void {
    this.stateService.prevStep();
  }

  isStepValid(): boolean {
    return this.stateService.isStepValid(this.currentStep());
  }

  sendAppointmentData(): void {
    const appointmentData = this.stateService.appointment();
    console.log('Enviando datos de la cita:', appointmentData);

    // Aquí se implementaría la llamada al servicio para crear/actualizar la cita
    // Por ahora, simularemos una respuesta exitosa

    setTimeout(() => {
      this.stateService.setSubmitting(false);
      this.stateService.setSuccess(true);
      this.toastService.presentToast('Cita creada exitosamente', 'success');
    }, 1500);

    /* Código real de envío (comentado para esta demo)
    if (appointmentData.id === 0) {
      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          this.stateService.setSubmitting(false);
          
          if (response && response.statusCode === 200) {
            this.stateService.setSuccess(true);
            this.stateService.appointment.set(response.data);
            this.toastService.presentToast('Cita creada exitosamente', 'success');
          }
        },
        error: (error) => {
          this.stateService.setSubmitting(false);
          this.toastService.presentToast(
            'Error al crear la cita. Intente nuevamente.',
            'danger'
          );
        }
      });
    } else {
      this.appointmentService.updateAppointment(appointmentData.id, appointmentData).subscribe({
        next: (response) => {
          this.stateService.setSubmitting(false);
          
          if (response.statusCode === 200) {
            this.stateService.setSuccess(true);
            this.toastService.presentToast('Cita actualizada exitosamente', 'success');
          }
        },
        error: (error) => {
          this.stateService.setSubmitting(false);
          this.toastService.presentToast(
            'Error al actualizar la cita. Intente nuevamente.',
            'danger'
          );
        }
      });
    }
    */
  }

  // Métodos auxiliares para la plantilla
  getFullName(): string {
    const userData = this.appointment().userData;
    return `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
  }

  getSelectedProfessionalName(): string {
    const professionalData = this.appointment().professionalData;
    if (professionalData && professionalData.user) {
      return `${professionalData.user.first_name || ''} ${professionalData.user.last_name || ''}`.trim();
    }
    return '';
  }

  getSelectedSpecialty(): string {
    const specialtyData = this.appointment().specialty;
    return specialtyData;
  }

  getFormattedDayOfWeek(): string {
    const dayIndex = this.stateService.selectedDayIndex();
    if (dayIndex !== -1) {
      const selectedDay = this.stateService.selectedProfessionalAvailability()[dayIndex];
      return selectedDay ? selectedDay.day : '';
    }
    return '';
  }
}
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
import { Router } from '@angular/router';
import { Appointment } from 'src/app/core/interfaces/appointment.interface';

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
    WizardStepperComponent,
  ],
  template: `
    @if(!success()) {
    <div class="wizard-container">
      <!-- Componente de stepper -->
      <app-wizard-stepper
        [currentStep]="currentStep()"
        [isScheduleAssignment]="isScheduleAssignment"
      ></app-wizard-stepper>

      <!-- Contenido de los pasos -->
      <div class="wizard-content">
        @if (currentStep() === 1 && !isScheduleAssignment) {
        <app-patient-data-step></app-patient-data-step>
        } @else if (currentStep() === 2 && !isScheduleAssignment) {
        <app-specialty-selection-step></app-specialty-selection-step>
        } @else if (currentStep() === 3 && !isScheduleAssignment) {
        <app-professional-selection-step></app-professional-selection-step>
        } @else if (currentStep() === 4 || isScheduleAssignment) {
        <app-schedule-selection-step
          [isAssigningToPendingAppointment]="isScheduleAssignment"
        ></app-schedule-selection-step>
        }
      </div>

      <!-- Botones de navegación -->
      <div class="buttons-container">
        <button
          class="prev-button"
          (click)="prevStep()"
          [disabled]="
            (currentStep() === 1 && !isScheduleAssignment) || isSubmitting()
          "
        >
          Anterior
        </button>
        <button
          class="next-button"
          (click)="nextStep()"
          [disabled]="!isStepValid() || isSubmitting()"
        >
          <span *ngIf="!(currentStep() === 4 && isSubmitting())">
            @if (isScheduleAssignment) { @if (isAgendaManual()) { Confirmar cita
            } @else { Confirmar horario } } @else { @if (currentStep() < 4) {
            Siguiente } @else { @if (isAgendaManual()) { Confirmar cita } @else
            { Confirmar } } }
          </span>
          <span
            *ngIf="currentStep() === 4 && isSubmitting()"
            class="button-loading"
          >
            <i class="fas fa-spinner fa-spin"></i> Procesando...
          </span>
        </button>
      </div>
    </div>
    } @else {
    <app-appointment-assigned
      [isPending]="isAgendaPendiente()"
      [isManual]="isAgendaManual()"
      [patientName]="getFullName()"
      [professionalName]="getSelectedProfessionalName()"
      [professionalPhone]="getProfessionalPhone()"
      [specialty]="getSelectedSpecialty()"
      [date]="appointment().appointment_date"
      [time]="appointment().appointment_time"
      [dayOfWeek]="getFormattedDayOfWeek()"
      [appointment]="appointment()"
      (appointmentSaved)="onAppointmentSaved($event)"
    ></app-appointment-assigned>

    <div class="action-buttons">
      <button class="back-button" (click)="goBackToAppointments()">
        Volver a citas
      </button>
    </div>
    }
  `,
  styleUrls: ['./appointment-wizard.component.scss'],
})
export class AppointmentWizardComponent implements OnInit {
  public currentStep = this.stateService.currentStep;
  public isSubmitting = this.stateService.isSubmitting;
  public success = this.stateService.success;
  public appointment = this.stateService.appointment;
  public isScheduleAssignment: boolean = false;

  constructor(
    private stateService: AppointmentStateService,
    private appointmentService: AppointmentService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isScheduleAssignment = history.state.scheduleAssignment === true;

    if (this.isScheduleAssignment) {
      this.stateService.currentStep.set(4);
    }

    const navData = history.state.appointment;
    if (navData) {
      this.stateService.appointment.set(navData);
      localStorage.setItem('selectedAppointment', JSON.stringify(navData));
    }
  }

  nextStep(): void {
    if (this.isStepValid()) {
      this.stateService.updateAppointmentForStep();

      if (this.isScheduleAssignment) {
        this.confirmScheduleAssignment();
      } else if (this.currentStep() < 4) {
        this.stateService.nextStep();
      } else {
        if (this.isAgendaManual()) {
          this.stateService.setSuccess(true);
        } else {
          this.stateService.setSubmitting(true);
          this.sendAppointmentData();
        }
      }
    } else {
      this.toastService.presentToast(
        'Por favor, complete todos los campos antes de continuar.',
        'warning'
      );
    }
  }

  prevStep(): void {
    if (this.isScheduleAssignment) {
      // Si estamos en modo de asignación de horario, volver a la lista de citas
      this.router.navigate(['/call-center/dash/assigment']);
    } else {
      this.stateService.prevStep();
    }
  }

  isStepValid(): boolean {
    if (this.isScheduleAssignment && this.isAgendaManual()) {
      return true;
    }

    if (this.isScheduleAssignment) {
      return this.stateService.isStepValid(4);
    }

    return this.stateService.isStepValid(this.currentStep());
  }

  confirmScheduleAssignment(): void {
    this.stateService.setSubmitting(true);
  
    const appointmentData = this.stateService.appointment();
    console.log('Confirmando cita con datos:', appointmentData);
  
    // Asegurarse de que el estado sea CONFIRMED
    const updatedAppointment = {
      ...appointmentData,
      status: 'CONFIRMED',
    };
  
    this.appointmentService
      .updateAppointment(appointmentData.id, updatedAppointment as Appointment)
      .subscribe({
        next: (response) => {
          this.stateService.setSubmitting(false);
  
          if (response && response.statusCode === 200) {
            console.log('Respuesta exitosa al confirmar cita:', response);
            
            const updatedAppointment = {
              ...response.data,
              professionalData: appointmentData.professionalData,
              specialtyData: appointmentData.specialtyData,
              userData: appointmentData.userData,
              specialty: appointmentData.specialty,
              appointment_date: response.data.appointment_date?.split('T')[0] || response.data.appointment_date,
            };
            
            this.stateService.appointment.set(updatedAppointment);
            
            this.stateService.setSuccess(true);
            
            this.toastService.presentToast(
              'Horario asignado exitosamente',
              'success'
            );
          } else {
            console.error('Error al confirmar horario:', response);
            this.toastService.presentToast(
              'Error al asignar horario. Intente nuevamente.',
              'danger'
            );
          }
        },
        error: (error) => {
          console.error('Error al confirmar horario:', error);
          this.stateService.setSubmitting(false);
          this.toastService.presentToast(
            'Error al asignar horario. Intente nuevamente.',
            'danger'
          );
        },
      });
  }

  sendAppointmentData(): void {
    const appointmentData = this.stateService.appointment();
    console.log('Enviando datos de la cita:', appointmentData);

    // Aquí se implementaría la llamada al servicio para crear/actualizar la cita
    if (appointmentData.id === 0) {
      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          this.stateService.setSubmitting(false);

          if (response && response.statusCode === 200) {
            this.stateService.setSuccess(true);
            this.stateService.appointment.set(response.data);
            this.toastService.presentToast(
              'Cita creada exitosamente',
              'success'
            );
          } else {
            this.toastService.presentToast(
              'Error al crear la cita. Intente nuevamente.',
              'danger'
            );
          }
        },
        error: (error) => {
          this.stateService.setSubmitting(false);
          this.toastService.presentToast(
            'Error al crear la cita. Intente nuevamente.',
            'danger'
          );
        },
      });
    } else {
      this.appointmentService
        .updateAppointment(appointmentData.id, appointmentData)
        .subscribe({
          next: (response) => {
            this.stateService.setSubmitting(false);

            if (response.statusCode === 200) {
              this.stateService.setSuccess(true);
              this.toastService.presentToast(
                'Cita actualizada exitosamente',
                'success'
              );
            } else {
              this.toastService.presentToast(
                'Error al actualizar la cita. Intente nuevamente.',
                'danger'
              );
            }
          },
          error: (error) => {
            this.stateService.setSubmitting(false);
            this.toastService.presentToast(
              'Error al actualizar la cita. Intente nuevamente.',
              'danger'
            );
          },
        });
    }
  }

  // Método para manejar cuando se guarda una cita pendiente
  onAppointmentSaved(success: boolean): void {
    if (success) {
      // Resetear el estado del wizard
      setTimeout(() => {
        this.stateService.resetState();
      }, 2000);
    }
  }

  // Navegar de vuelta a la lista de citas
  goBackToAppointments(): void {
    this.router.navigate(['/call-center/dash/assigment']);
  }

  // Verificar si el profesional tiene agenda manual
  isAgendaManual(): boolean {
    const professionalData = this.appointment().professionalData;
    // Considera primero el tipo de horario del profesional
    if (professionalData?.scheduleInfo?.type === 'MANUAL') {
      return true;
    }
    
    // Si estamos en modo de asignación y es una cita pendiente por confirmar sin horario asignado
    // también la tratamos como manual
    if (this.isScheduleAssignment && 
        this.appointment().status === 'TO_BE_CONFIRMED' && 
        (!this.appointment().appointment_date || !this.appointment().appointment_time)) {
      return true;
    }
    
    return false;
  }

  // Verificar si la cita está pendiente
  isAgendaPendiente(): boolean {
    return (
      this.appointment().status === 'PENDING' ||
      this.appointment().status === 'TO_BE_CONFIRMED'
    );
  }

  // Métodos auxiliares para la plantilla
  getFullName(): string {
    const userData = this.appointment().userData;
    return `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
  }

  getSelectedProfessionalName(): string {
    const professionalData = this.appointment().professionalData;
    if (professionalData && professionalData.user) {
      return `${professionalData.user.first_name || ''} ${
        professionalData.user.last_name || ''
      }`.trim();
    }
    return '';
  }

  getProfessionalPhone(): string {
    const professionalData = this.appointment().professionalData;
    return professionalData?.user?.phone || '';
  }

  getSelectedSpecialty(): string {
    const specialtyData = this.appointment().specialty;
    return specialtyData;
  }

  getFormattedDayOfWeek(): string {
    const dayIndex = this.stateService.selectedDayIndex();
    if (dayIndex !== -1) {
      const selectedDay =
        this.stateService.selectedProfessionalAvailability()[dayIndex];
      return selectedDay ? selectedDay.day : '';
    }
    return '';
  }
}
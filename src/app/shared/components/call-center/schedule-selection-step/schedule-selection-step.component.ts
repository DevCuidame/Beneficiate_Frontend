import {
  Component,
  effect,
  inject,
  Injector,
  Input,
  OnInit,
  runInInjectionContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientSearchBarComponent } from '../patient-search-bar/patient-search-bar.component';
import { AppointmentStateService } from 'src/app/core/services/appointment-state.service';
import { ScheduleService } from 'src/app/core/services/schedule.service';
import { CalendarSelectorComponent } from '../../calendar-selector/calendar-selector.component';
import { MedicalProfessionalService } from 'src/app/core/services/medicalProfessional.service';

@Component({
  selector: 'app-schedule-selection-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PatientSearchBarComponent,
    CalendarSelectorComponent,
  ],
  template: `
    <div class="step-content">
      <!-- Barra de búsqueda del paciente para mostrar resumen -->
      <app-patient-search-bar
        [image_path]="patientData.image?.image_path"
        [first_name]="patientData.first_name"
        [last_name]="patientData.last_name"
        [firstTime]="appointmentFirstTime"
      ></app-patient-search-bar>

      <!-- Información del profesional para asignación de horario -->
      @if (isAssigningToPendingAppointment) {
      <div class="professional-info-card">
        <div class="professional-header">
          <h3>Información del Profesional</h3>
        </div>
        <div class="professional-details">
          <p><strong>Profesional:</strong> {{ professionalName }}</p>
          <p><strong>Especialidad:</strong> {{ specialtyName }}</p>
          <p><strong>Tipo de agenda:</strong> {{ getScheduleTypeLabel() }}</p>
        </div>
      </div>
      }

      <h2>Horario de atención</h2>

      @if (isManualSchedule) {
      <div class="schedule-type-info manual">
        <i class="fas fa-calendar-alt"></i>
        <p>
          Por favor, selecciona la fecha y
          hora que acordaron o haga clic en "{{ isAssigningToPendingAppointment ? 'Confirmar cita' : 'Siguiente' }}" para continuar sin
          seleccionar fecha y hora.
        </p>
      </div>
      } @else {
      <div class="schedule-type-info online">
        <i class="fas fa-calendar-check"></i>
        <p>Selecciona el día y la hora para la consulta</p>
      </div>
      }

      <!-- Contenedor para agenda manual -->
      @if (isManualSchedule) {
      <div class="manual-schedule-container">
        <div class="form-group">
          <label>Fecha acordada</label>
          <div class="date-selector-container">
            <!-- Selector de calendario personalizado -->
            <app-calendar-selector
              [selectedDate]="selectedDate"
              [minDate]="scheduleService.getTodayFormatted()"
              (dateSelected)="onCalendarDateSelected($event)"
            ></app-calendar-selector>

            <!-- Input de fecha oculto para formularios que requieren un input -->
            <input
              type="date"
              class="date-input visually-hidden"
              [min]="scheduleService.getTodayFormatted()"
              [(ngModel)]="selectedDate"
              (change)="onDateChange($event)"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Hora acordada</label>
          <div class="time-selector-container">
            <div class="time-slots">
              @for (hour of availableHours; track hour) {
              <div
                class="time-slot"
                [class.selected]="selectedTime === hour"
                (click)="selectTimeSlot(hour)"
              >
                {{ hour }}
              </div>
              }
            </div>
          </div>
        </div>
      </div>
      }

      <!-- Contenedor de días y horas disponibles -->
      @if(!isManualSchedule){
      <div class="schedule-container">
        @if (availableSchedule && availableSchedule.length > 0) { @for (schedule
        of availableSchedule; track schedule.day; let dayIdx = $index) {
        <div
          class="day-card"
          [class.selected]="isDaySelected(dayIdx)"
          [class.has-selected-hour]="hasSelectedHour(dayIdx)"
          (click)="selectDay(dayIdx)"
        >
          <h4>{{ schedule.day }}</h4>
          <div class="time-list">
            <ul>
              @for (hour of schedule.hours; track hour) {
              <li
                [class.active]="isHourSelected(dayIdx, hour)"
                (click)="selectHour(hour, dayIdx); $event.stopPropagation()"
              >
                {{ hour }}
              </li>
              }
            </ul>
          </div>
        </div>
        } } @else {
        <div class="no-availability">
          <p>No hay horarios disponibles para este profesional.</p>
          @if (isAssigningToPendingAppointment) {
          <button
            class="refresh-button"
            (click)="loadProfessionalAvailability()"
          >
            <i class="fas fa-sync-alt"></i> Recargar disponibilidad
          </button>
          }
        </div>
        }
      </div>
      }
    </div>
  `,
  styleUrls: ['./schedule-selection-step.component.scss'],
})
export class ScheduleSelectionStepComponent implements OnInit {
  @Input() isAssigningToPendingAppointment: boolean = false;

  public patientData: any;
  public appointmentFirstTime: boolean = false;
  public availableSchedule: { day: string; date: string; hours: string[] }[] = [];
  public isManualSchedule: boolean = false;
  private injector = inject(Injector);

  public selectedDate: string = '';
  public selectedTime: string = '';
  public professionalName: string = '';
  public specialtyName: string = '';

  public availableHours: string[] = [];
  
  // Variable para mantener la determinación inicial de agenda manual
  private initialDetermination: boolean = false;

  constructor(
    private stateService: AppointmentStateService,
    public scheduleService: ScheduleService,
    private medicalProfessionalService: MedicalProfessionalService
  ) {
    this.generateTimeOptions();
  }

  ngOnInit(): void {
    const appointment = this.stateService.appointment();
    this.patientData = appointment.userData;
    this.appointmentFirstTime = appointment.first_time;

    // Extrae información del profesional para mostrar en el modo de asignación
    if (this.isAssigningToPendingAppointment && appointment.professionalData) {
      this.professionalName = `${
        appointment.professionalData.user?.first_name || ''
      } ${appointment.professionalData.user?.last_name || ''}`;
      this.specialtyName =
        appointment.specialty || appointment.specialtyData?.name || '';

      // Carga la disponibilidad del profesional si estamos asignando a una cita pendiente
      this.loadProfessionalAvailability();
    }

    // Determinar si es agenda manual (una sola vez al inicio)
    this.determineManualSchedule();
    this.initialDetermination = this.isManualSchedule;

    this.availableSchedule = this.stateService.selectedProfessionalAvailability();

    runInInjectionContext(this.injector, () => {
      effect(() => {
        const availability = this.stateService.selectedProfessionalAvailability();
        this.availableSchedule = availability || [];
        
        // Solo actualizamos la fecha y hora seleccionadas, no el modo de agenda
        const appointment = this.stateService.appointment();
        if (appointment.appointment_date) {
          this.selectedDate = appointment.appointment_date;
        }
        if (appointment.appointment_time) {
          this.selectedTime = appointment.appointment_time;
        }
      });
    });
  }

  determineManualSchedule(): void {
    const appointment = this.stateService.appointment();
    
    // Es agenda manual si el profesional tiene tipo MANUAL
    const isManualByType = appointment.professionalData?.scheduleInfo?.type === 'MANUAL';
    
    // O si es una cita pendiente por confirmar sin fecha/hora asignada (en modo asignación)
    const isPendingConfirmation = this.isAssigningToPendingAppointment && 
                                 appointment.status === 'TO_BE_CONFIRMED';
                                 
    this.isManualSchedule = isManualByType || isPendingConfirmation;
    
    // Inicializar fechas si ya existen en el appointment
    if (appointment.appointment_date) {
      this.selectedDate = appointment.appointment_date;
    }
    if (appointment.appointment_time) {
      this.selectedTime = appointment.appointment_time;
    }
  }

  getScheduleTypeLabel(): string {
    const appointment = this.stateService.appointment();
    const scheduleType = appointment.professionalData?.scheduleInfo?.type;
    
    switch (scheduleType) {
      case 'MANUAL':
        return 'Manual';
      case 'ONLINE':
        return 'En línea';
      case 'UNAVAILABLE':
        return 'No disponible';
      default:
        return 'Pendiente por confirmar';
    }
  }

  loadProfessionalAvailability(): void {
    const appointment = this.stateService.appointment();
    if (!appointment.professional_id) return;

    this.medicalProfessionalService
      .fetchMedicalProfessionals(parseInt(appointment.specialty_id))
      .subscribe((professionals) => {
        const professional = professionals.find(
          (p) => p.id.toString() === appointment.professional_id
        );

        if (professional && professional.availability) {
          const availabilityArray =
            this.scheduleService.processProfessionalAvailability(
              professional.availability
            );

          this.stateService.setAvailability(availabilityArray);
        }
      });
  }

  generateTimeOptions() {
    const hours = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute of ['00', '30']) {
        if (hour === 18 && minute === '30') continue; //
        hours.push(`${hour.toString().padStart(2, '0')}:${minute}`);
      }
    }
    this.availableHours = hours;
  }

  onCalendarDateSelected(date: string) {
    this.selectedDate = date;
    this.updateAppointmentManual();
  }

  hasSelectedHour(dayIndex: number): boolean {
    if (dayIndex === -1 || !this.availableSchedule[dayIndex]) return false;

    return this.stateService.selectedDayIndex() === dayIndex;
  }

  selectTimeSlot(time: string) {
    this.selectedTime = time;
    this.updateAppointmentManual();
  }

  onDateChange(event: any) {
    this.selectedDate = event.target.value;
    this.updateAppointmentManual();
  }

  onTimeChange(event: any) {
    this.selectedTime = event.target.value;
    this.updateAppointmentManual();
  }

  updateAppointmentManual() {
    if (this.selectedDate && this.selectedTime) {
      // Mantener isManualSchedule constante (no debe cambiarse por actualización de fecha/hora)
      this.isManualSchedule = this.initialDetermination;
      
      this.stateService.appointment.update((app) => ({
        ...app,
        appointment_date: this.selectedDate,
        appointment_time: this.selectedTime,
        status: this.isAssigningToPendingAppointment
          ? 'CONFIRMED'
          : 'TO_BE_CONFIRMED',
      }));

      this.stateService.selectHour(this.selectedTime);
      this.stateService.manualDate.set(this.selectedDate);
    } else {
      this.stateService.appointment.update((app) => ({
        ...app,
        status: app.status,
      }));
    }
  }

  selectDay(index: number): void {
    // Solo ejecutar si no estamos en modo manual
    if (!this.isManualSchedule) {
      this.stateService.selectDay(index);
    }
  }

  selectHour(hour: string, dayIndex: number): void {
    // Solo ejecutar si no estamos en modo manual
    if (!this.isManualSchedule) {
      this.stateService.appointment.update((app) => ({
        ...app,
        appointment_date: '',
        appointment_time: '',
      }));

      setTimeout(() => {
        const selectedDay = this.availableSchedule[dayIndex];

        if (!selectedDay) {
          console.error('Día seleccionado no válido');
          return;
        }

        this.stateService.selectDay(dayIndex);
        this.stateService.selectHour(hour);

        this.stateService.appointment.update((app) => ({
          ...app,
          appointment_date: selectedDay.date,
          appointment_time: hour,
          status: this.isAssigningToPendingAppointment ? 'CONFIRMED' : 'PENDING',
        }));

        console.log(
          `Hora seleccionada: ${hour} para el día: ${selectedDay.day} (índice ${dayIndex})`
        );
      }, 10);
    }
  }

  isDaySelected(index: number): boolean {
    return this.stateService.selectedDayIndex() === index;
  }

  isHourSelected(dayIndex: number, hour: string): boolean {
    const selectedDayIndex = this.stateService.selectedDayIndex();
    const selectedHour = this.stateService.selectedHour();

    return selectedDayIndex === dayIndex && selectedHour === hour;
  }
}
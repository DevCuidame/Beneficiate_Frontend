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
            <p><strong>Profesional:</strong> {{professionalName}}</p>
            <p><strong>Especialidad:</strong> {{specialtyName}}</p>
          </div>
        </div>
      }

      <h2>Horario de atención</h2>

      @if (isManualSchedule) {
      <div class="schedule-type-info manual">
        <i class="fas fa-calendar-alt"></i>
        <p>
          Este profesional maneja agenda manual. Por favor selecciona la fecha y
          hora que acordaron o haga clic en "Siguiente" para continuar sin seleccionar fecha y hora.
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

        <div class="manual-note">
          <p>
            <i class="fas fa-info-circle"></i> La confirmación de la cita está
            sujeta a la disponibilidad del profesional.
          </p>
          <p>
            <i class="fas fa-exclamation-circle"></i> Si no ha acordado fecha y hora aún, 
            puede hacer clic en "Siguiente" para continuar y contactar al profesional posteriormente.
          </p>
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
            <button class="refresh-button" (click)="loadProfessionalAvailability()">
              <i class="fas fa-sync-alt"></i> Recargar disponibilidad
            </button>
          }
        </div>
        }
      </div>
      }
    </div>
  `,
  styles: [`
    @import url('../../../styles/wizard.styles.scss');
    
    .professional-info-card {
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 20px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      
      .professional-header {
        background-color: var(--ion-color-primary);
        color: white;
        padding: 10px 15px;
        
        h3 {
          margin: 0;
          font-size: 1.1rem;
        }
      }
      
      .professional-details {
        padding: 15px;
        
        p {
          margin: 5px 0;
          font-size: 1rem;
          
          strong {
            color: var(--ion-color-dark);
          }
        }
      }
    }
    
    .no-availability {
      width: 100%;
      text-align: center;
      padding: 30px 20px;
      background-color: #f9f9f9;
      border-radius: 10px;
      color: var(--ion-color-medium);
      
      p {
        margin-bottom: 15px;
      }
      
      .refresh-button {
        background-color: var(--ion-color-primary);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 15px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        i {
          margin-right: 5px;
        }
        
        &:hover {
          background-color: var(--ion-color-primary-shade);
          transform: translateY(-2px);
        }
      }
    }
  `]
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
      this.professionalName = `${appointment.professionalData.user?.first_name || ''} ${appointment.professionalData.user?.last_name || ''}`;
      this.specialtyName = appointment.specialty || appointment.specialtyData?.name || '';
      
      // Carga la disponibilidad del profesional si estamos asignando a una cita pendiente
      this.loadProfessionalAvailability();
    }
  
    const newIsManualSchedule = appointment.professionalData?.scheduleInfo?.type === 'MANUAL';
    
    if (this.isManualSchedule !== newIsManualSchedule) {
      this.stateService.appointment.update(app => ({
        ...app,
        appointment_date: '',
        appointment_time: '',
        status: 'TO_BE_CONFIRMED' // Cambiamos el estado para agenda manual
      }));
      
      this.stateService.selectDay(-1); 
      this.stateService.selectHour(''); 
      this.stateService.manualDate.set(''); 
      
      this.selectedDate = '';
      this.selectedTime = '';
    }
    
    this.isManualSchedule = newIsManualSchedule;
  
    if (this.isManualSchedule) {
      this.selectedDate = '';
      this.selectedTime = '';
    }
  
    this.availableSchedule = this.stateService.selectedProfessionalAvailability();
    console.log('Disponibilidad inicial:', this.availableSchedule);
  
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const availability = this.stateService.selectedProfessionalAvailability();
        console.log('Disponibilidad actualizada:', availability);
        this.availableSchedule = availability || [];
  
        const appointment = this.stateService.appointment();
        const newManualSchedule = appointment.professionalData?.scheduleInfo?.type === 'MANUAL';
        
        if (this.isManualSchedule !== newManualSchedule) {
          this.stateService.appointment.update(app => ({
            ...app,
            appointment_date: '',
            appointment_time: '',
            status: newManualSchedule ? 'TO_BE_CONFIRMED' : 'PENDING'
          }));
          
          this.stateService.selectDay(-1);
          this.stateService.selectHour('');
          this.stateService.manualDate.set('');
          
          this.selectedDate = '';
          this.selectedTime = '';
          this.isManualSchedule = newManualSchedule;
        }
      });
    });
  }

  loadProfessionalAvailability(): void {
    const appointment = this.stateService.appointment();
    if (!appointment.professional_id) return;
    
    // Recuperar la disponibilidad del profesional
    this.medicalProfessionalService.fetchMedicalProfessionals(parseInt(appointment.specialty_id))
      .subscribe(professionals => {
        // Encontrar el profesional actual
        const professional = professionals.find(p => p.id.toString() === appointment.professional_id);
        
        if (professional && professional.availability) {
          // Procesar la disponibilidad
          const availabilityArray = this.scheduleService.processProfessionalAvailability(
            professional.availability
          );
          
          // Actualizar el estado
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

  // Para el nuevo selector de calendario
  onCalendarDateSelected(date: string) {
    this.selectedDate = date;
    this.updateAppointmentManual();
  }

  hasSelectedHour(dayIndex: number): boolean {
    if (dayIndex === -1 || !this.availableSchedule[dayIndex]) return false;

    return this.stateService.selectedDayIndex() === dayIndex;
  }

  // Para selección de tiempo mejorada
  selectTimeSlot(time: string) {
    this.selectedTime = time;
    this.updateAppointmentManual();
  }

  // Métodos para agenda manual
  onDateChange(event: any) {
    this.selectedDate = event.target.value;
    this.updateAppointmentManual();
  }

  onTimeChange(event: any) {
    this.selectedTime = event.target.value;
    this.updateAppointmentManual();
  }

  updateAppointmentManual() {
    // Si seleccionaron fecha y hora, actualiza el appointment
    if (this.selectedDate && this.selectedTime) {
      this.stateService.appointment.update((app) => ({
        ...app,
        appointment_date: this.selectedDate,
        appointment_time: this.selectedTime,
        status: this.isAssigningToPendingAppointment ? 'CONFIRMED' : 'TO_BE_CONFIRMED',
      }));

      this.stateService.selectHour(this.selectedTime);
      this.stateService.manualDate.set(this.selectedDate);
    } else {
      // Si no hay fecha y hora seleccionadas, mantén el status actual
      this.stateService.appointment.update((app) => ({
        ...app,
        status: app.status
      }));
    }
  }

  selectDay(index: number): void {
    this.stateService.selectDay(index);
  }

  selectHour(hour: string, dayIndex: number): void {
    this.stateService.appointment.update(app => ({
      ...app,
      appointment_date: '',
      appointment_time: ''
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
      
      console.log(`Hora seleccionada: ${hour} para el día: ${selectedDay.day} (índice ${dayIndex})`);
    }, 10);
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
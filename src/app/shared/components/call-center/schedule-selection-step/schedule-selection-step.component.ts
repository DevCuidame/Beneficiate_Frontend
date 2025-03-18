import {
  Component,
  effect,
  inject,
  Injector,
  OnInit,
  runInInjectionContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientSearchBarComponent } from '../patient-search-bar/patient-search-bar.component';
import { AppointmentStateService } from 'src/app/core/services/appointment-state.service';
import { ScheduleService } from 'src/app/core/services/schedule.service';
import { CalendarSelectorComponent } from '../../calendar-selector/calendar-selector.component';

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
      <app-patient-search-bar
        [image_path]="patientData.image?.image_path"
        [first_name]="patientData.first_name"
        [last_name]="patientData.last_name"
        [firstTime]="appointmentFirstTime"
      ></app-patient-search-bar>

      <h2>Horario de atención</h2>

      @if (isManualSchedule) {
      <div class="schedule-type-info manual">
        <i class="fas fa-calendar-alt"></i>
        <p>
          Este profesional maneja agenda manual. Por favor selecciona la fecha y
          hora que acordaron.
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
          No hay horarios disponibles para este profesional.
        </div>
        }
      </div>
      }
    </div>
  `,
  styleUrls: ['./schedule-selection-step.component.scss'],
})
export class ScheduleSelectionStepComponent implements OnInit {
  public patientData: any;
  public appointmentFirstTime: boolean = false;
  public availableSchedule: { day: string; date: string; hours: string[] }[] =
    [];
  public isManualSchedule: boolean = false;
  private injector = inject(Injector);

  public selectedDate: string = '';
  public selectedTime: string = '';

  public availableHours: string[] = [];

  constructor(
    private stateService: AppointmentStateService,
    public scheduleService: ScheduleService
  ) {
    this.generateTimeOptions();
  }

  ngOnInit(): void {
    const appointment = this.stateService.appointment();
    this.patientData = appointment.userData;
    this.appointmentFirstTime = appointment.first_time;
  
    const newIsManualSchedule = appointment.professionalData?.scheduleInfo?.type === 'MANUAL';
    
    if (this.isManualSchedule !== newIsManualSchedule) {
      this.stateService.appointment.update(app => ({
        ...app,
        appointment_date: '',
        appointment_time: '',
        status: 'PENDING' 
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
            status: 'PENDING'
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
    if (this.selectedDate && this.selectedTime) {
      this.stateService.appointment.update((app) => ({
        ...app,
        appointment_date: this.selectedDate,
        appointment_time: this.selectedTime,
        status: 'CONFIRMED',
      }));

      this.stateService.selectHour(this.selectedTime);
      this.stateService.manualDate.set(this.selectedDate);
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
        status: 'CONFIRMED',
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

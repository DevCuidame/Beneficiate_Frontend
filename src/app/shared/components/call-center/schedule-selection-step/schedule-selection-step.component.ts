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
        [cityName]="cityName"
        [ticketNumber]="ticketNumber"
      ></app-patient-search-bar>

      <h2>Horario de atención</h2>

      <!-- Contenedor para agenda manual - incluye datos del doctor -->
      <div class="manual-schedule-container">
        <div class="form-group">
          <h3>Información del profesional médico</h3>
          
          <div class="doctor-info">
            <div class="form-field">
              <label for="doctorName">Nombre del doctor</label>
              <input 
                type="text"
                id="doctorName"
                [(ngModel)]="doctorName"
                (change)="updateDoctorInfo()"
                placeholder="Ingrese el nombre completo del doctor"
              />
            </div>
            
            <div class="form-field">
              <label for="doctorCity">Ciudad</label>
              <input 
                type="text"
                id="doctorCity"
                [(ngModel)]="doctorCity"
                (change)="updateDoctorInfo()"
                placeholder="Ciudad donde atiende el doctor"
              />
            </div>
            
            <div class="form-field">
              <label for="doctorAddress">Dirección</label>
              <input 
                type="text"
                id="doctorAddress"
                [(ngModel)]="doctorAddress"
                (change)="updateDoctorInfo()"
                placeholder="Dirección de consultorio"
              />
            </div>
          </div>
        </div>

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
            <i class="fas fa-info-circle"></i>
            Nota: Si no conoce aún la fecha y hora, puede dejar estos campos vacíos y continuar.
            La cita quedará pendiente por asignar.
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./schedule-selection-step.component.scss'],
})
export class ScheduleSelectionStepComponent implements OnInit {
  @Input() isAssigningToPendingAppointment: boolean = false;

  public patientData: any;
  public appointmentFirstTime: boolean = false;
  public availableSchedule: { day: string; date: string; hours: string[] }[] = [];
  public isManualSchedule: boolean = true; // Ahora siempre es manual
  private injector = inject(Injector);

  public selectedDate: string = '';
  public selectedTime: string = '';
  public professionalName: string = '';
  public specialtyName: string = '';
  public ticketNumber: string = '';
  public cityName: string = '';
  
  // Nuevos campos para información del doctor
  public doctorName: string = '';
  public doctorCity: string = '';
  public doctorAddress: string = '';

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
    this.ticketNumber = appointment.ticket_number!;
    if (appointment.location && Array.isArray(appointment.location) && appointment.location.length > 0) {
      this.cityName = appointment.location[0].township_name;
    } else {
      this.cityName = 'No especificada';
    }


    // Extrae información del profesional para mostrar en el modo de asignación
    if (this.isAssigningToPendingAppointment && appointment.professionalData) {
      this.professionalName = `${
        appointment.professionalData.user?.first_name || ''
      } ${appointment.professionalData.user?.last_name || ''}`;
      this.specialtyName =
        appointment.specialty || appointment.specialtyData?.name || '';
        
      // También inicializamos los campos del doctor si ya existen
      if (appointment.professionalData.user) {
        this.doctorName = this.professionalName;
      }
      if (appointment.professionalData.consultation_address) {
        this.doctorAddress = appointment.professionalData.consultation_address;
      }
      if (appointment.professionalData.attention_township_id) {
        this.doctorCity = appointment.professionalData.attention_township_id;
      }
    }

    this.availableSchedule = this.stateService.selectedProfessionalAvailability();

    runInInjectionContext(this.injector, () => {
      effect(() => {
        const availability = this.stateService.selectedProfessionalAvailability();
        this.availableSchedule = availability || [];
        
        // Solo actualizamos la fecha y hora seleccionadas
        const appointment = this.stateService.appointment();
        if (appointment.appointment_date) {
          this.selectedDate = appointment.appointment_date;
        }
        if (appointment.appointment_time) {
          this.selectedTime = appointment.appointment_time;
        }
        
        // También actualizamos los datos del doctor si existen
        if (appointment.professionalData) {
          if (appointment.professionalData.user) {
            this.doctorName = `${appointment.professionalData.user.first_name || ''} ${appointment.professionalData.user.last_name || ''}`.trim();
          }
          
          if (appointment.professionalData.consultation_address) {
            this.doctorAddress = appointment.professionalData.consultation_address;
          }
          
          if (appointment.professionalData.attention_township_id) {
            this.doctorCity = appointment.professionalData.attention_township_id;
          }
        }
      });
    });
  }

  getScheduleTypeLabel(): string {
    return 'Manual';
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

  selectTimeSlot(time: string) {
    this.selectedTime = time;
    this.updateAppointmentManual();
  }

  onDateChange(event: any) {
    this.selectedDate = event.target.value;
    this.updateAppointmentManual();
  }
  
  updateDoctorInfo() {
    this.updateAppointmentManual();
  }

  updateAppointmentManual() {
    // Creamos un objeto para los datos del profesional si no existe
    let professionalData = this.stateService.appointment().professionalData || {};
    
    // Actualizamos o creamos los datos del profesional
    professionalData = {
      ...professionalData,
      scheduleInfo: { type: 'MANUAL', description: 'Agenda manual', isBooking: false },
      user: {
        ...(this.doctorName ? { first_name: this.doctorName.split(' ')[0] } : {}),
        ...(this.doctorName.split(' ').length > 1 ? { last_name: this.doctorName.split(' ').slice(1).join(' ') } : {}),
        ...professionalData.user
      },
      consultation_address: this.doctorAddress,
      attention_township_id: this.doctorCity
    };
    
    // Actualizamos el appointment con los nuevos datos
    this.stateService.appointment.update((app) => ({
      ...app,
      appointment_date: this.selectedDate,
      appointment_time: this.selectedTime,
      status: this.isAssigningToPendingAppointment ? 'CONFIRMED' : 'TO_BE_CONFIRMED',
      professionalData: professionalData
    }));

    this.stateService.selectHour(this.selectedTime);
    this.stateService.manualDate.set(this.selectedDate);
  }
}
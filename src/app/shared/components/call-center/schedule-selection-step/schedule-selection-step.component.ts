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
import { IonicModule, ToastController } from '@ionic/angular';
import { PatientSearchBarComponent } from '../patient-search-bar/patient-search-bar.component';
import { AppointmentStateService } from 'src/app/core/services/appointment-state.service';
import { ScheduleService } from 'src/app/core/services/schedule.service';
import { CalendarSelectorComponent } from '../../calendar-selector/calendar-selector.component';
import { MedicalProfessionalService } from 'src/app/core/services/medicalProfessional.service';
import { LocationService } from 'src/app/modules/auth/services/location.service';

@Component({
  selector: 'app-schedule-selection-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
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

      <!-- Información del profesional para asignación de horario si estamos en modo asignación -->
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
              <label for="doctorDepartment">Departamento</label>
              <select
                id="doctorDepartment"
                [(ngModel)]="selectedDepartment"
                (change)="onDepartmentChange()"
                class="location-select"
              >
                <option value="" disabled selected>Seleccione un departamento</option>
                <option *ngFor="let department of departments" [value]="department.id">
                  {{ department.name }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label for="doctorCity">Ciudad</label>
              <select
                id="doctorCity"
                [(ngModel)]="selectedCity"
                (change)="onCityChange()"
                class="location-select"
                [disabled]="!selectedDepartment || cities.length === 0"
              >
                <option value="" disabled selected>Seleccione una ciudad</option>
                <option *ngFor="let city of cities" [value]="city.id">
                  {{ city.name }}
                </option>
              </select>
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
            Nota: Si no conoce aún la fecha y hora, puede dejar estos campos
            vacíos y continuar. La cita quedará pendiente por asignar.
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
  public doctorAddress: string = '';

  // Variables para el sistema de departamento/ciudad
  public departments: any[] = [];
  public cities: any[] = [];
  public selectedDepartment: any = '';
  public selectedCity: any = '';
  public selectedCityName: string = '';
  public selectedDepartmentName: string = '';

  public availableHours: string[] = [];

  constructor(
    private stateService: AppointmentStateService,
    public scheduleService: ScheduleService,
    private medicalProfessionalService: MedicalProfessionalService,
    private locationService: LocationService,
    private toastController: ToastController
  ) {
    this.generateTimeOptions();
  }

  ngOnInit(): void {
    const appointment = this.stateService.appointment();
    this.patientData = appointment.userData;
    this.appointmentFirstTime = appointment.first_time;
    this.ticketNumber = appointment.ticket_number || '';
    if (
      appointment.location &&
      Array.isArray(appointment.location) &&
      appointment.location.length > 0
    ) {
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

      // Inicializar los valores de departamento/ciudad si existen
      if (appointment.professionalData.attention_township_id) {
        this.selectedCity = appointment.professionalData.attention_township_id;
      }
    }

    this.availableSchedule =
      this.stateService.selectedProfessionalAvailability();

    // Cargar departamentos
    this.loadDepartments();

    runInInjectionContext(this.injector, () => {
      effect(() => {
        const availability =
          this.stateService.selectedProfessionalAvailability();
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
            this.doctorName = `${
              appointment.professionalData.user.first_name || ''
            } ${appointment.professionalData.user.last_name || ''}`.trim();
          }

          if (appointment.professionalData.consultation_address) {
            this.doctorAddress =
              appointment.professionalData.consultation_address;
          }

          if (appointment.professionalData.attention_township_id) {
            this.selectedCity = appointment.professionalData.attention_township_id;
          }
        }
      });
    });
  }

  loadDepartments() {
    this.locationService.fetchDepartments();
    this.locationService.departments$.subscribe((departments) => {
      this.departments = departments;

      // Si ya hay una ciudad seleccionada, encontrar el departamento correspondiente
      if (this.selectedCity) {
        this.findDepartmentForCity(this.selectedCity);
      }
    });
  }

  findDepartmentForCity(cityId: string | number) {
    // Convertir el cityId a número si es string
    const numericCityId = typeof cityId === 'string' ? parseInt(cityId) : cityId;
    
    // Esta función busca el departamento correspondiente para una ciudad ya seleccionada
    // Iterar por cada departamento y comprobar si la ciudad pertenece a él
    let found = false;
    
    this.departments.forEach(department => {
      this.locationService.fetchCitiesByDepartment(department.id);
      this.locationService.cities$.subscribe(cities => {
        if (found) return; // Si ya se encontró, no continuar buscando
        
        const cityExists = cities.some(city => city.id === numericCityId);
        if (cityExists) {
          found = true;
          this.selectedDepartment = department.id;
          this.selectedDepartmentName = department.name;
          
          // Guardar las ciudades y actualizar la selección
          this.cities = cities;
          this.selectedCity = numericCityId;
          
          // Buscar el nombre de la ciudad
          const city = cities.find(c => c.id === numericCityId);
          if (city) {
            this.selectedCityName = city.name;
          }
          
          this.updateDoctorInfo();
        }
      });
    });
  }

  loadCities(departmentId: any) {
    if (!departmentId) return;
    
    this.locationService.fetchCitiesByDepartment(departmentId);
    this.locationService.cities$.subscribe(cities => {
      this.cities = cities;
    });
  }

  onDepartmentChange() {
    if (!this.selectedDepartment) return;
    
    
    this.selectedCity = '';
    this.selectedCityName = '';
    
    this.loadCities(this.selectedDepartment);
    
    const department = this.departments.find(d => d.id == this.selectedDepartment);
    if (department) {
      this.selectedDepartmentName = department.name;
    }
    
  }

  onCityChange() {
    
    if (this.selectedCity) {
      const city = this.cities.find(c => c.id == this.selectedCity);
      if (city) {
        this.selectedCityName = city.name;
      }
      
      this.updateDoctorInfo();
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'primary'
    });
    toast.present();
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
      attention_township_id: this.selectedCity ? this.selectedCity.toString() : ''
    };

    // Actualizamos location tambien en la estructura si está disponible
    if (this.selectedCity && this.selectedCityName && this.selectedDepartment && this.selectedDepartmentName) {
      professionalData.location = {
        township_id: this.selectedCity.toString(),
        township_name: this.selectedCityName,
        township_code: '',
        department_id: this.selectedDepartment.toString(),
        department_name: this.selectedDepartmentName
      };
    }

    // Actualizamos el appointment con los nuevos datos
    this.stateService.appointment.update((app) => ({
      ...app,
      appointment_date: this.selectedDate,
      appointment_time: this.selectedTime,
      status: this.isAssigningToPendingAppointment ? 'CONFIRMED' : 'TO_BE_CONFIRMED',
      professionalData: professionalData,
      // Utilizamos los nuevos campos de la interfaz Appointment
      city_id: this.selectedCity ? parseInt(this.selectedCity.toString()) : undefined,
      temp_address: this.doctorAddress ? this.doctorAddress : undefined,
      temp_doctor_name: this.doctorName ? this.doctorName : undefined
    }));

    this.stateService.selectHour(this.selectedTime);
    this.stateService.manualDate.set(this.selectedDate);
  }
}
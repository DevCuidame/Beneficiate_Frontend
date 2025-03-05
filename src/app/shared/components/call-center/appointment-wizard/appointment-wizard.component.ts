import { HealthProfessionalCardComponent } from 'src/app/shared/components/health-professional-card/health-professional-card.component';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { identificationOptions } from 'src/app/core/constants/indentifications';
import { AppointmentAssignedComponent } from '../appointment-assigned/appointment-assigned.component';
import { SpecialityCardComponent } from '../specialty-card/speciality-card.component';
import { PatientSearchBarComponent } from '../patient-search-bar/patient-search-bar.component';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { User } from 'src/app/core/interfaces/auth.interface';
import { Appointment } from 'src/app/core/interfaces/appointment.interface';
import { MedicalSpecialtyService } from 'src/app/core/services/medicalSpecialty.service';
import { MedicalProfessionalService } from 'src/app/core/services/medicalProfessional.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';

@Component({
  selector: 'app-appointment-wizard',
  imports: [
    CommonModule,
    FormsModule,
    AppointmentAssignedComponent,
    HealthProfessionalCardComponent,
    SpecialityCardComponent,
    PatientSearchBarComponent,
  ],
  templateUrl: './appointment-wizard.component.html',
  styleUrls: ['./appointment-wizard.component.scss'],
})
export class AppointmentWizardComponent implements OnInit {
  public currentStep = 1;
  public success: boolean = false;
  public identificationOptions = identificationOptions;
  @ViewChild('carouselContent', { static: false })
  carouselContent!: ElementRef<HTMLDivElement>;
  public searchTerm = signal<string>('');
  public selectedSpecialtyIndex = signal<number | null>(null);
  public selectedProfessionalIndex = signal<number | null>(null);
  public selectedDayIndex = -1;
  public selectedHour = '';
  public selectedProfessionalAvailability = signal<
    { day: string; date: string; hours: string[] }[]
  >([]);

  constructor(
    private medicalSpecialtyService: MedicalSpecialtyService,
    private medicalProfessionalService: MedicalProfessionalService,
    private appointmentService: AppointmentService
  ) {}

  public specialties = computed(() => {
    const searchTermLower = this.searchTerm().toLowerCase();
    return this.medicalSpecialtyService
      .specialties()
      .filter((spec) => spec.name.toLowerCase().includes(searchTermLower));
  });

  public selectedSpecialtyId = signal<number | null>(null);
  public professionals = computed(() => {
    const searchTermLower = this.searchTerm().toLowerCase();

    if (!this.medicalProfessionalService.professionals().length) {
      return [];
    }

    return this.medicalProfessionalService.professionals().filter((prof) => {
      const firstName = prof.user?.first_name?.toLowerCase() || '';
      const lastName = prof.user?.last_name?.toLowerCase() || '';

      return (
        firstName.includes(searchTermLower) ||
        lastName.includes(searchTermLower)
      );
    });
  });

  public appointment: Appointment = {
    id: 0,
    user_id: '',
    beneficiary_id: '',
    professional_id: '',
    specialty_id: '',
    appointment_date: '',
    appointment_time: '',
    status: 'PENDING',
    notes: '',
    specialty: '',
    created_at: '',
    created_at_formatted: '',
    is_for_beneficiary: false,
    first_time: false,
    control: false,
    userData: {} as User | Beneficiary,
  };

  ngOnInit() {
    this.medicalSpecialtyService.fetchMedicalSpecialties().subscribe();

    const navData = history.state.appointment;

    if (navData) {
      this.appointment = navData;
      localStorage.setItem('selectedAppointment', JSON.stringify(navData));
    } else {
      const storedData = localStorage.getItem('selectedAppointment');
      if (storedData) {
        this.appointment = JSON.parse(storedData);
      }
    }

    this.medicalProfessionalService.loadFromCache();
    this.medicalProfessionalService.professionals().forEach((prof) => {
      console.log('Profesional cargado:', prof);
    });
  }

  updateSearchTerm(term: string) {
    this.searchTerm.set(term);
  }

  loadProfessionals(specialtyId: number) {
    this.selectedSpecialtyId.set(specialtyId);
    this.medicalProfessionalService
      .fetchMedicalProfessionals(specialtyId)
      .subscribe();
  }

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.isStep1Valid();
      case 2:
        return this.isStep2Valid();
      case 3:
        return this.isStep3Valid();
      case 4:
        return this.isStep4Valid();
      default:
        return false;
    }
  }

  isStep1Valid(): boolean {
    return (
      (!!this.appointment.userData.identification_type &&
        !!this.appointment.userData.identification_number &&
        !!this.appointment.userData.first_name &&
        !!this.appointment.userData.phone &&
        !!this.appointment.userData.email &&
        !!this.appointment.first_time) ||
      !!this.appointment.control
    );
  }

  isStep2Valid(): boolean {
    return this.selectedSpecialtyId() !== null;
  }

  isStep3Valid(): boolean {
    return this.selectedProfessionalIndex() !== null;
  }

  isStep4Valid(): boolean {
    return this.selectedDayIndex !== -1 && this.selectedHour !== '';
  }
  // Navegación entre pasos
  nextStep() {
    if (this.isStepValid()) {
      // Actualizar la información antes de enviarla
      this.updateAppointmentData();

      console.log('📌 Datos actualizados antes de enviar:', this.appointment);

      if (this.currentStep < 4) {
        this.currentStep++;
      } else {
        alert('Cita agendada con éxito');
        this.success = true;
        this.sendAppointmentData(); // Llamada para enviar la cita al backend
      }
    } else {
      alert('Por favor, complete todos los campos antes de continuar.');
    }
  }

  updateAppointmentData() {
    if (this.currentStep === 3) {
      // Validar que haya un índice seleccionado antes de acceder al array
      const selectedIndex = this.selectedProfessionalIndex();
      const selectedSpecialtyIndex = this.selectedSpecialtyIndex();
      if (selectedIndex !== null) {
        const selectedProfessional = this.professionals()[selectedIndex];
        if (selectedProfessional) {
          this.appointment.professional_id = selectedProfessional.id.toString();
        }
      }
      if (selectedSpecialtyIndex!== null) {
        const selectedSpecialty = this.specialties()[selectedSpecialtyIndex];
        if (selectedSpecialty) {
          this.appointment.specialty_id = selectedSpecialty.id.toString();
        }
      }
    }

    if (this.currentStep === 4) {
      if (this.selectedDayIndex !== -1) {
        const selectedDayAvailability =
          this.selectedProfessionalAvailability()[this.selectedDayIndex];

        if (selectedDayAvailability) {
          this.appointment.appointment_date = selectedDayAvailability.date;
          this.appointment.appointment_time = this.selectedHour || '';
          this.appointment.status = 'CONFIRMED';
        }
      }
    }
  }

  sendAppointmentData() {
    console.log('🚀 Enviando cita al backend:', this.appointment);

    this.appointmentService
      .updateAppointment(this.appointment.id, this.appointment)
      .subscribe(
        (response) => {
          console.log('✅ Respuesta del servidor:', response);
        },
        (error) => {
          console.error('❌ Error al enviar la cita:', error);
        }
      );
  }

  toggleSelection(selected: string) {
    if (selected === 'firstTime') {
      this.appointment.first_time = true;
      this.appointment.control = false;
    } else if (selected === 'control') {
      this.appointment.control = true;
      this.appointment.first_time = false;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Seleccionar especialidad
  selectSpecialty(index: number) {
    this.selectedSpecialtyIndex.set(index);
    const selectedSpecialty = this.specialties()[index];

    if (selectedSpecialty) {
      this.selectedSpecialtyId.set(selectedSpecialty.id);

      this.medicalProfessionalService.clearCache();
      this.medicalProfessionalService
        .fetchMedicalProfessionals(selectedSpecialty.id)
        .subscribe(() => {
          console.log(
            'Profesionales actualizados para la especialidad:',
            selectedSpecialty.name
          );
        });
    }
  }

  // Seleccionar profesional

  selectProfessional(index: number) {
    this.selectedProfessionalIndex.set(index);
    const selectedProfessional = this.professionals()[index];

    if (selectedProfessional && selectedProfessional.availability) {
      const availabilityArray = Object.entries(
        selectedProfessional.availability
      )
        .filter(([_, range]) => range.start && range.end) // Validación adicional
        .map(([day, range]) => ({
          day: range.formatted_date,
          date: range.date,
          hours: this.generateTimeSlots(range.start, range.end),
        }));

      console.log(
        '📌 Disponibilidad estructurada con `date`:',
        availabilityArray
      );
      this.selectedProfessionalAvailability.set(availabilityArray);
    } else {
      console.warn('⚠️ No hay disponibilidad para este profesional.');
      this.selectedProfessionalAvailability.set([]); // Asegura que se limpie la data anterior
    }
  }

  /**
   * Genera intervalos de 30 minutos entre una hora de inicio y fin.
   * @param startTime - Hora de inicio en formato "HH:mm:ss".
   * @param endTime - Hora de fin en formato "HH:mm:ss".
   */
  generateTimeSlots(startTime: string, endTime: string): string[] {
    const slots: string[] = [];
    const start = new Date(`2025-01-01T${startTime}`);
    const end = new Date(`2025-01-01T${endTime}`);

    if (start >= end) {
      console.warn(`Rango de tiempo inválido: ${startTime} - ${endTime}`);
      return slots;
    }

    while (start < end) {
      slots.push(start.toTimeString().split(' ')[0].slice(0, 5)); // HH:mm
      start.setMinutes(start.getMinutes() + 30);
    }

    return slots;
  }

  // Seleccionar día y hora
  selectDay(index: number) {
    this.selectedDayIndex = index;
    this.selectedHour = '';
  }

  selectHour(hour: string, dayIndex: number) {
    this.selectedDayIndex = dayIndex;
    this.selectedHour = hour;
  }

  scrollLeft() {
    if (this.carouselContent) {
      this.carouselContent.nativeElement.scrollBy({
        left: -200,
        behavior: 'smooth',
      });
    }
  }

  // Desplaza a la derecha
  scrollRight() {
    if (this.carouselContent) {
      this.carouselContent.nativeElement.scrollBy({
        left: 200,
        behavior: 'smooth',
      });
    }
  }

  scrollHours(timeList: HTMLElement) {
    timeList.scrollBy({ top: 100, behavior: 'smooth' });
  }

  // Obtener el nombre completo del profesional seleccionado
  getSelectedProfessionalName(): string {
    if (this.selectedProfessionalIndex() !== null) {
      const selectedProfessional =
        this.professionals()[this.selectedProfessionalIndex()!];
      return selectedProfessional
        ? `${selectedProfessional.user.first_name} ${selectedProfessional.user.last_name}`
        : '';
    }
    return '';
  }

  // Obtener el nombre de la especialidad seleccionada
  getSelectedSpecialty(): string {
    if (this.selectedSpecialtyIndex() !== null) {
      return this.specialties()[this.selectedSpecialtyIndex()!].name;
    }
    return '';
  }
  

  // Formatear el día de la semana para la cita
  getFormattedDayOfWeek(): string {
    if (this.selectedDayIndex !== -1) {
      const selectedDayAvailability =
        this.selectedProfessionalAvailability()[this.selectedDayIndex];
      return selectedDayAvailability ? selectedDayAvailability.day : '';
    }
    return '';
  }
}

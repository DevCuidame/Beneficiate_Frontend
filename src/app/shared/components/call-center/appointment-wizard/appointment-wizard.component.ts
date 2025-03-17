import {
  BeneficiaryImage,
  Image,
  UserImage,
} from './../../../../core/interfaces/user.interface';
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
import { Appointment } from 'src/app/core/interfaces/appointment.interface';
import { MedicalSpecialtyService } from 'src/app/core/services/medicalSpecialty.service';
import { MedicalProfessionalService } from 'src/app/core/services/medicalProfessional.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { MedicalProfessional } from 'src/app/core/interfaces/medicalProfessional.interface';
import { MedicalSpecialty } from 'src/app/core/interfaces/medicalSpecialty.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { ToastService } from 'src/app/core/services/toast.service';

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
  public beneficiaryId: string = '';
  public userId: string = '';
  public isSubmitting = false;

  // Add to your component class:
  public searchState = {
    loading: false,
    notFound: false,
    success: false,
    error: false,
  };

  debounceIdentificationSearch: any;

  constructor(
    private medicalSpecialtyService: MedicalSpecialtyService,
    private medicalProfessionalService: MedicalProfessionalService,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private toastService: ToastService
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
    userData: {} as any,
    professionalData: {} as MedicalProfessional,
    specialtyData: {} as MedicalSpecialty,
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
    this.medicalProfessionalService.professionals().forEach((prof) => {});
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
    const fieldsValid =
      !!this.appointment.userData.identification_type &&
      !!this.appointment.userData.identification_number &&
      !!this.appointment.userData.first_name &&
      !!this.appointment.userData.phone &&
      !!this.appointment.userData.email;

    const optionSelected =
      !!this.appointment.first_time || !!this.appointment.control;

    return fieldsValid && optionSelected;
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
      this.updateAppointmentData();
      if (this.currentStep < 4) {
        this.currentStep++;
      } else {
        this.isSubmitting = true;
        this.sendAppointmentData();
      }
    } else {
      this.toastService.presentToast(
        'Por favor, complete todos los campos antes de continuar.',
        'warning'
      );
    }
  }

  updateAppointmentData() {

    if (this.userId) {
      this.appointment.user_id = this.userId;
    }


    if (this.beneficiaryId) {
      this.appointment.beneficiary_id = this.beneficiaryId;
      this.appointment.is_for_beneficiary = true;
    } else {
      this.appointment.is_for_beneficiary = false;
    }

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
      if (selectedSpecialtyIndex !== null) {
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
    console.log(
      '🚀 ~ AppointmentWizardComponent ~ sendAppointmentData ~ this.appointment:',
      this.appointment
    );

    // if (this.appointment.id === 0) {
    //   this.appointmentService.createAppointment(this.appointment).subscribe(
    //     (response) => {
    //       this.isSubmitting = false;

    //       if (response) {
    //         this.appointment = response;
    //         if (response.statusCode === 200) {
    //           this.success = true;
    //           this.appointment = response.data;
    //           this.toastService.presentToast(
    //             'Cita creada exitosamente',
    //             'success'
    //           );
    //         }
    //       }
    //     },
    //     (error) => {
    //       this.isSubmitting = false;
    //       this.toastService.presentToast(
    //         'Error al crear la cita. Intente nuevamente.',
    //         'danger'
    //       );
    //     }
    //   );
    // } else {
    //   this.appointmentService
    //     .updateAppointment(this.appointment.id, this.appointment)
    //     .subscribe(
    //       (response) => {
    //         this.isSubmitting = false;

    //         if (response.statusCode === 200) {
    //           this.success = true;
    //           this.toastService.presentToast(
    //             'Cita actualizada exitosamente',
    //             'success'
    //           );
    //         }
    //       },
    //       (error) => {
    //         this.isSubmitting = false;
    //         this.toastService.presentToast(
    //           'Error al actualizar la cita. Intente nuevamente.',
    //           'danger'
    //         );
    //       }
    //     );
    // }
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
        .subscribe(() => {});
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
        .filter(([_, range]) => range.start && range.end)
        .map(([day, range]) => ({
          day: range.formatted_date,
          date: range.date,
          hours: this.generateTimeSlots(range.start, range.end),
        }));

      this.selectedProfessionalAvailability.set(availabilityArray);
    } else {
      console.warn('⚠️ No hay disponibilidad para este profesional.');
      this.selectedProfessionalAvailability.set([]);
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

  getSelectedSpecialty(): string {
    if (this.selectedSpecialtyIndex() !== null) {
      return this.specialties()[this.selectedSpecialtyIndex()!].name;
    }
    return '';
  }

  getFormattedDayOfWeek(): string {
    if (this.selectedDayIndex !== -1) {
      const selectedDayAvailability =
        this.selectedProfessionalAvailability()[this.selectedDayIndex];
      return selectedDayAvailability ? selectedDayAvailability.day : '';
    }
    return '';
  }

  searchUserByIdentification() {
    const idType = this.appointment.userData.identification_type;
    const idNumber = this.appointment.userData.identification_number;

    // Reset search state
    this.searchState = {
      loading: false,
      notFound: false,
      success: false,
      error: false,
    };

    if (!idType || !idNumber) {
      return;
    }

    // Set loading state
    this.searchState.loading = true;

    this.userService.findByIdentification(idType, idNumber).subscribe(
      (userData: any) => {
        this.searchState.loading = false;

        if (userData) {
          if ('user_id' in userData) {
            this.appointment.beneficiary_id = userData.id.toString();
            this.appointment.user_id = userData.user_id.toString();  
            this.appointment.is_for_beneficiary = true;   
            // It's a Beneficiary
            this.appointment.userData = {
              ...this.appointment.userData,
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              phone: userData.phone || '',
              email: userData.email || 'Sin correo electrónico',
              image: userData.image
                ? ({
                    id: userData.image.id || 0,
                    public_name: userData.image.public_name || '',
                    private_name: userData.image.private_name || '',
                    image_path: userData.image.image_path || '',
                    uploaded_at: userData.image.uploaded_at || '',
                    // beneficiary_id: (userData.image as BeneficiaryImage).beneficiary_id || ''
                  } as BeneficiaryImage)
                : ({} as BeneficiaryImage),
            };
          } else {
            this.beneficiaryId = '';
            this.userId = userData.id.toString();

            // Directly assign to appointment object
            this.appointment.beneficiary_id = '';
            this.appointment.user_id = userData.id.toString();
            this.appointment.is_for_beneficiary = false;

            this.appointment.userData = {
              ...this.appointment.userData,
              id: userData.id || 0,
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              phone: userData.phone || '',
              email: userData.email || '',
              is_for_beneficiary: false,
              // Handle the image properly based on its type
              image: userData.image
                ? ({
                    id: userData.image.id || 0,
                    public_name: userData.image.public_name || '',
                    private_name: userData.image.private_name || '',
                    image_path: userData.image.image_path || '',
                    uploaded_at: userData.image.uploaded_at || '',
                    user_id: (userData.image as UserImage).user_id || '',
                  } as UserImage)
                : ({} as UserImage),
            };
          }

          this.searchState.success = true;

          setTimeout(() => {
            this.searchState.success = false;
          }, 3000);
        } else {
          this.searchState.notFound = true;

          const isUserBeneficiary =
            'beneficiary_id' in this.appointment.userData;

          // Reset appointment IDs
          this.appointment.user_id = '';
          this.appointment.beneficiary_id = '';

          if (isUserBeneficiary) {
            // It's a Beneficiary
            this.appointment.userData = {
              ...this.appointment.userData,
              first_name: '',
              last_name: '',
              phone: '',
              email: '',
              image: {
                id: 0,
                public_name: '',
                private_name: '',
                image_path: '',
                uploaded_at: '',
                beneficiary_id: '',
              } as BeneficiaryImage,
            };
          } else {
            // It's a User
            this.appointment.userData = {
              ...this.appointment.userData,
              first_name: '',
              last_name: '',
              phone: '',
              email: '',
              image: {
                id: 0,
                public_name: '',
                private_name: '',
                image_path: '',
                uploaded_at: '',
                user_id: '',
              } as UserImage,
            };
          }
        }
      },
      (error) => {
        // Set error state
        this.searchState.loading = false;
        this.searchState.error = true;
        console.error('Error al buscar usuario:', error);
      }
    );
  }

  onIdentificationNumberChange() {
    if (this.debounceIdentificationSearch) {
      clearTimeout(this.debounceIdentificationSearch);
    }

    this.debounceIdentificationSearch = setTimeout(() => {
      this.searchUserByIdentification();
    }, 500);
  }

  getFullName(): string {
    const firstName = this.appointment.userData.first_name || '';
    const lastName = this.appointment.userData.last_name || '';
    return firstName && lastName ? `${firstName} ${lastName}` : '';
  }
}

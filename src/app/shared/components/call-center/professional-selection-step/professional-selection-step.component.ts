import { Component, OnInit, ViewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientSearchBarComponent } from '../patient-search-bar/patient-search-bar.component';
import { HealthProfessionalCardComponent } from 'src/app/shared/components/health-professional-card/health-professional-card.component';
import { MedicalProfessionalService } from 'src/app/core/services/medicalProfessional.service';
import { AppointmentStateService } from 'src/app/core/services/appointment-state.service';
import { ScheduleService } from 'src/app/core/services/schedule.service';

@Component({
  selector: 'app-professional-selection-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PatientSearchBarComponent,
    HealthProfessionalCardComponent
  ],
  template: `
    <div class="step-content">
      <!-- Barra de búsqueda del paciente para mostrar resumen -->
      <app-patient-search-bar
        [image_path]="patientData.image?.image_path"
        [first_name]="patientData.first_name"
        [last_name]="patientData.last_name"
        [firstTime]="appointmentFirstTime"
        (searchTermChanged)="updateSearchTerm($event)"
      ></app-patient-search-bar>

      <h2>Médico</h2>
      <p>Selecciona el profesional con el que deseas agendar cita</p>
      
      <!-- Carrusel de profesionales -->
      <div class="carousel-container">
        <button class="arrow left-arrow" (click)="scrollLeft()">
          &#10094;
        </button>
        
        <div class="carousel-content" #carouselContent>
          @for (prof of professionals(); track prof.id) {
            <app-health-professional-card
              [buttonVisible]="false"
              [first_name]="prof.user.first_name"
              [gender]="prof.user.gender"
              [last_name]="prof.user.last_name"
              [specialty_name]="prof.specialty_name"
              [profileImage]="prof.image.header_path"
              [scheduleInfo]="prof.scheduleInfo"
              [agendaColor]="'var(--ion-color-secondary)'"
              [class.selected]="isSelected(prof.id)"
              [class.unavailable]="prof.scheduleInfo!.type === 'UNAVAILABLE'"
              (click)="selectProfessional(prof)"
              [availability]="true"
            ></app-health-professional-card>
          }
        </div>
        
        <button class="arrow right-arrow" (click)="scrollRight()">
          &#10095;
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./professional-selection-step.component.scss']
})
export class ProfessionalSelectionStepComponent implements OnInit {
  @ViewChild('carouselContent', { static: false })
  carouselContent!: ElementRef<HTMLDivElement>;

  public patientData: any;
  public appointmentFirstTime: boolean = false;

  constructor(
    private stateService: AppointmentStateService,
    private medicalProfessionalService: MedicalProfessionalService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit(): void {
    const appointment = this.stateService.appointment();
    this.patientData = appointment.userData;
    this.appointmentFirstTime = appointment.first_time;
    
    // Cargar profesionales para la especialidad seleccionada si aún no se han cargado
    const specialtyId = this.stateService.selectedSpecialtyId();
    if (specialtyId !== null) {
      this.medicalProfessionalService
        .fetchMedicalProfessionals(specialtyId)
        .subscribe();
    }
  }

  isProfessionalAvailable(professional: any): boolean {
    return professional.scheduleInfo?.type !== 'UNAVAILABLE';
  }


  // Filtrado de profesionales basado en el término de búsqueda
  public professionals = computed(() => {
    const searchTerm = this.stateService.searchTerm().toLowerCase();
    
    if (!this.medicalProfessionalService.professionals().length) {
      return [];
    }

    return this.medicalProfessionalService.professionals().filter((prof) => {
      const firstName = prof.user?.first_name?.toLowerCase() || '';
      const lastName = prof.user?.last_name?.toLowerCase() || '';

      return (
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm)
      );
    });
  });

  updateSearchTerm(term: string): void {
    this.stateService.updateSearchTerm(term);
  }

  selectProfessional(professional: any): void {

    if (!this.isProfessionalAvailable(professional)) {
      return; // No hacer nada si el profesional no está disponible
    }

    // Encontrar el índice del profesional seleccionado
    const index = this.professionals().findIndex(prof => prof.id === professional.id);
    
    if (index !== -1) {
      // Actualizar estado con el profesional seleccionado
      this.stateService.selectProfessional(index);
      
      // Actualizar el ID del profesional en la cita
      this.stateService.appointment.update(app => ({
        ...app,
        professional_id: professional.id.toString(),
        professionalData: professional
      }));
      
      // Procesar disponibilidad del profesional para el siguiente paso
      this.processAvailability(professional);
    }
  }

  processAvailability(professional: any): void {
    if (professional && professional.availability) {
      const availabilityArray = this.scheduleService.processProfessionalAvailability(
        professional.availability
      );
      
      this.stateService.setAvailability(availabilityArray);
    } else {
      console.warn('⚠️ No hay disponibilidad para este profesional.');
      this.stateService.setAvailability([]);
    }
  }

  isSelected(professionalId: number): boolean {
    const selectedIndex = this.stateService.selectedProfessionalIndex();
    if (selectedIndex === null) return false;
    
    const selectedProfessional = this.professionals()[selectedIndex];
    return selectedProfessional?.id === professionalId;
  }

  scrollLeft(): void {
    if (this.carouselContent) {
      this.carouselContent.nativeElement.scrollBy({
        left: -200,
        behavior: 'smooth',
      });
    }
  }

  scrollRight(): void {
    if (this.carouselContent) {
      this.carouselContent.nativeElement.scrollBy({
        left: 200,
        behavior: 'smooth',
      });
    }
  }
}
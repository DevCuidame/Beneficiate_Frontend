import { HealthProfessionalCardComponent } from 'src/app/shared/components/health-professional-card/health-professional-card.component';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { identificationOptions } from 'src/app/core/constants/indentifications';
import { AppointmentAssignedComponent } from '../appointment-assigned/appointment-assigned.component';
import { SpecialityCardComponent } from '../specialty-card/speciality-card.component';
import { PatientSearchBarComponent } from '../patient-search-bar/patient-search-bar.component';
import { personaData } from 'src/app/core/interfaces/personaData.interface';

@Component({
  selector: 'app-appointment-wizard',
  imports: [CommonModule, FormsModule, AppointmentAssignedComponent, HealthProfessionalCardComponent, SpecialityCardComponent, PatientSearchBarComponent],
  templateUrl: './appointment-wizard.component.html',
  styleUrls: ['./appointment-wizard.component.scss'],
})
export class AppointmentWizardComponent {
  public currentStep = 2;
  public success: boolean = false;
  public identificationOptions = identificationOptions;
  @ViewChild('carouselContent', { static: false })
  carouselContent!: ElementRef<HTMLDivElement>;

  public personaData!: personaData

  specialties = [
    { name: 'Cardiología', img: 'assets/cardiologia.jpg' },
    { name: 'Fisioterapia', img: 'assets/fisioterapia.jpg' },
    { name: 'Nefrología', img: 'assets/nefrologia.jpg' },
  ];
  selectedSpecialtyIndex = -1;

  professionals = [
    {
      name: 'Dr. Miguel Ojeda',
      specialty: 'Cardiólogo',
      img: 'assets/doc1.jpg',
      status: 'Agenda disponible',
    },
    {
      name: 'Dra. María López',
      specialty: 'Cardiólogo',
      img: 'assets/doc2.jpg',
      status: 'Agenda disponible',
    },
    {
      name: 'Dr. Edward Gomez',
      specialty: 'Urólogo',
      img: 'assets/doc3.jpg',
      status: 'Agenda disponible',
    },
    {
      name: 'Dr. Edward Gomez',
      specialty: 'Urólogo',
      img: 'assets/doc3.jpg',
      status: 'Agenda disponible',
    },
    {
      name: 'Dr. Edward Gomez',
      specialty: 'Urólogo',
      img: 'assets/doc3.jpg',
      status: 'Agenda disponible',
    },
    {
      name: 'Dr. Edward Gomez',
      specialty: 'Urólogo',
      img: 'assets/doc3.jpg',
      status: 'Agenda disponible',
    },
    {
      name: 'Dr. Edward Gomez',
      specialty: 'Urólogo',
      img: 'assets/doc3.jpg',
      status: 'Agenda disponible',
    },
  ];
  selectedProfessionalIndex = -1;

  schedules = [
    {
      day: 'jue. 20 febrero',
      hours: ['11:00 Hrs.', '13:00 Hrs.', '15:00 Hrs.', '16:00 Hrs.'],
    },
    {
      day: 'vie. 21 febrero',
      hours: ['10:00 Hrs.', '12:00 Hrs.', '14:00 Hrs.', '16:00 Hrs.'],
    },
    {
      day: 'lun. 24 febrero',
      hours: ['09:00 Hrs.', '11:00 Hrs.', '13:00 Hrs.'],
    },
    {
      day: 'mar. 25 febrero',
      hours: ['10:00 Hrs.', '12:00 Hrs.', '15:00 Hrs.', '17:00 Hrs.'],
    },
  ];
  selectedDayIndex = -1;
  selectedHour = '';

  // Navegación entre pasos
  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    } else {
      alert('Cita agendada con éxito');
      this.success = true;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Seleccionar especialidad
  selectSpecialty(index: number) {
    this.selectedSpecialtyIndex = index;
  }

  // Seleccionar profesional
  selectProfessional(index: number) {
    this.selectedProfessionalIndex = index;
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
      this.carouselContent.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }

  // Desplaza a la derecha
  scrollRight() {
    if (this.carouselContent) {
      this.carouselContent.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }

}

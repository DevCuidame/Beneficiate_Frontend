import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { MedicalProfessionalService } from 'src/app/core/services/medicalProfessional.service';
import { MedicalSpecialtyService } from 'src/app/core/services/medicalSpecialty.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { Appointment } from 'src/app/core/interfaces/appointment.interface';
import { MedicalProfessional } from 'src/app/core/interfaces/medicalProfessional.interface';
import { MedicalSpecialty } from 'src/app/core/interfaces/medicalSpecialty.interface';

import { HeaderComponent } from '../../components/home/header/header.component';
import { FooterComponent } from '../../components/footer-component/footer-component.component';
import { DoDateComponent } from '../../components/home/do-date/do-date.component';
import { ChatComponent } from 'src/app/modules/home/pages/chat/chat.component';

@Component({
  selector: 'app-schedule',
  imports: [
    HeaderComponent,
    FooterComponent,
    DoDateComponent,
    IonicModule,
    CommonModule,
    ChatComponent
  ],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent  implements OnInit {
  isDisabled: boolean = true;
  isEditing: boolean = false;
  isChating: boolean = true;
  isDropdownOpen: boolean = false;
  idProfessional!: number | null;
  selectedSpecialtyName: string = 'Especialidad';
  selectedSpecialtyId = signal<number | null>(null);
  appointments: any[] = [];
  phoneNumber: string = '3195752651';
  message: string = '¡Hola! Quiero saber más sobre tus servicios.';

  private wsSubscription!: Subscription;
  public specialties = computed(() => {
    const data = this.medicalSpecialtyService.specialties();
    return data;
  });
  public professionals = computed(() => {
    const profesional = this.medicalProfessionalService.professionals();
    return profesional;
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

  constructor(
      private medicalProfessionalService: MedicalProfessionalService,
      private medicalSpecialtyService: MedicalSpecialtyService,
  ) { }

  ngOnInit() {
    this.medicalSpecialtyService.fetchMedicalSpecialties().subscribe();
    this.medicalProfessionalService.loadFromCache();

    this.medicalProfessionalService.getMedicalProfessionals().subscribe((data) => {
      this.medicalProfessionalService.professionals.set(data);
    });

    console.log(this.professionals());
    console.log(this.specialties());

  }

  // Terminar la logica (sacado de: appoiment-booking)
  onAppointmentCanceled(canceledId: number) {
    this.appointments = this.appointments.filter(
      (appointment) => appointment.id !== canceledId
    );
  }


  // --------------- Acciones de botonoes --------------- //

  toggleDropdown(specialty?: any): void {
    if (specialty) {
      this.selectedSpecialtyName = specialty.name;
      this.selectedSpecialtyId = specialty.id;

      this.medicalProfessionalService
          .fetchMedicalProfessionals(specialty.id)
          .subscribe();

      this.isDropdownOpen = false;
    } else {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  toggleChat(): boolean {
    this.isChating = !this.isChating;
    return this.isChating;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  toggleCard(id: number) {
    this.idProfessional = id;
    this.isDisabled = !this.isDisabled;
  }

  closeCard() {
    this.isDisabled = true;
  }

}

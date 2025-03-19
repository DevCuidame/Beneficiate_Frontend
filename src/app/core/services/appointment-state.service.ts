import { Injectable, signal, computed } from '@angular/core';
import { Appointment } from 'src/app/core/interfaces/appointment.interface';
import { MedicalProfessional } from 'src/app/core/interfaces/medicalProfessional.interface';
import { MedicalSpecialty } from 'src/app/core/interfaces/medicalSpecialty.interface';
import { BeneficiaryImage, Image, UserImage } from 'src/app/core/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentStateService {
  // Estado del wizard
  public currentStep = signal<number>(1);
  public searchTerm = signal<string>('');
  
  // Selección de especialidad
  public selectedSpecialtyIndex = signal<number | null>(null);
  public selectedSpecialtyId = signal<number | null>(null);
  
  // Selección de profesional
  public selectedProfessionalIndex = signal<number | null>(null);
  
  // Selección de horario
  public selectedDayIndex = signal<number>(-1);
  public selectedHour = signal<string>('');
  public selectedProfessionalAvailability = signal<
    { day: string; date: string; hours: string[] }[]
  >([]);
  public manualDate = signal<string>('');
  
  // Datos del paciente
  public beneficiaryId = signal<string>('');
  public userId = signal<string>('');
  
  // Estado de búsqueda
  public searchState = signal<{
    loading: boolean;
    notFound: boolean;
    success: boolean;
    error: boolean;
  }>({
    loading: false,
    notFound: false,
    success: false,
    error: false
  });
  
  // Datos completos de la cita
  public appointment = signal<Appointment>({
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
  });
  
  // Estado del formulario
  public isSubmitting = signal<boolean>(false);
  public success = signal<boolean>(false);
  
  constructor() {
    this.loadStoredAppointment();
  }
  
  // Métodos para manejar el estado
  
  public nextStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.update(step => step + 1);
    }
  }
  
  public prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }
  
  public updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }
  
  public selectSpecialty(index: number, specialtyId: number): void {
    this.selectedSpecialtyIndex.set(index);
    this.selectedSpecialtyId.set(specialtyId);
    
    // Reset profesional selection when specialty changes
    this.selectedProfessionalIndex.set(null);
  }
  
  public selectProfessional(index: number): void {
    this.selectedProfessionalIndex.set(index);
  }
  
  public selectDay(index: number): void {
    this.selectedDayIndex.set(index);
    this.selectedHour.set('');
  }
  
  public selectHour(hour: string): void {
    this.selectedHour.set(hour);
  }
  
  public setAvailability(availability: { day: string; date: string; hours: string[] }[]): void {
    this.selectedProfessionalAvailability.set(availability);
  }
  
  public toggleSelectionType(selected: 'firstTime' | 'control'): void {
    const currentAppointment = this.appointment();
    
    if (selected === 'firstTime') {
      this.appointment.update(app => ({
        ...app,
        first_time: true,
        control: false
      }));
    } else {
      this.appointment.update(app => ({
        ...app,
        control: true,
        first_time: false
      }));
    }
  }
  
  public updateUserData(userData: any, isForBeneficiary: boolean = false): void {
    this.appointment.update(app => ({
      ...app,
      userData: userData,
      is_for_beneficiary: isForBeneficiary
    }));
    
    if (isForBeneficiary) {
      this.beneficiaryId.set(userData.id?.toString() || '');
      this.userId.set(userData.user_id?.toString() || '');
    } else {
      this.beneficiaryId.set('');
      this.userId.set(userData.id?.toString() || '');
    }
  }
  
  public updateAppointmentForStep(): void {
    const currentStep = this.currentStep();
    const currentAppointment = { ...this.appointment() };
    
    if (this.userId()) {
      currentAppointment.user_id = this.userId();
    }
    
    if (this.beneficiaryId()) {
      currentAppointment.beneficiary_id = this.beneficiaryId();
      currentAppointment.is_for_beneficiary = true;
    } else {
      currentAppointment.is_for_beneficiary = false;
    }
    
    if (currentStep === 2) {
      // Update specialty data
      const specialtyId = this.selectedSpecialtyId();
      if (specialtyId !== null) {
        currentAppointment.specialty_id = specialtyId.toString();
      }
    }
    
    if (currentStep === 3) {
      const selectedIndex = this.selectedProfessionalIndex();
      if (selectedIndex !== null) {
      }
      
      if (currentAppointment.professionalData?.scheduleInfo?.type === 'MANUAL') {
        currentAppointment.status = 'TO_BE_CONFIRMED';
      }
    }
    
    if (currentStep === 4) {
      if (currentAppointment.professionalData?.scheduleInfo?.type === 'MANUAL') {
        if (this.manualDate() && this.selectedHour()) {
          currentAppointment.appointment_date = this.manualDate();
          currentAppointment.appointment_time = this.selectedHour();
        }
        currentAppointment.status = 'TO_BE_CONFIRMED';
      } else {
        const dayIndex = this.selectedDayIndex();
        const hour = this.selectedHour();
        
        if (dayIndex !== -1) {
          const selectedDayAvailability = this.selectedProfessionalAvailability()[dayIndex];
          
          if (selectedDayAvailability) {
            currentAppointment.appointment_date = selectedDayAvailability.date;
            currentAppointment.appointment_time = hour;
            currentAppointment.status = 'CONFIRMED';
          }
        }
      }
    }
    
    this.appointment.set(currentAppointment);
    this.saveAppointmentToStorage();
  }
  
  public setSubmitting(isSubmitting: boolean): void {
    this.isSubmitting.set(isSubmitting);
  }
  
  public setSuccess(success: boolean): void {
    this.success.set(success);
  }
  
  public resetState(): void {
    this.currentStep.set(1);
    this.searchTerm.set('');
    this.selectedSpecialtyIndex.set(null);
    this.selectedSpecialtyId.set(null);
    this.selectedProfessionalIndex.set(null);
    this.selectedDayIndex.set(-1);
    this.selectedHour.set('');
    this.selectedProfessionalAvailability.set([]);
    this.beneficiaryId.set('');
    this.userId.set('');
    this.isSubmitting.set(false);
    this.success.set(false);
    this.appointment.set({
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
    });
    
    localStorage.removeItem('selectedAppointment');
  }
  
  private loadStoredAppointment(): void {
    const storedData = localStorage.getItem('selectedAppointment');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        this.appointment.set(parsedData);
      } catch (e) {
        console.error('Error parsing stored appointment data', e);
      }
    }
  }
  
  private saveAppointmentToStorage(): void {
    localStorage.setItem('selectedAppointment', JSON.stringify(this.appointment()));
  }
  
  // Métodos para validación
  
  public isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.isPatientDataValid();
      case 2:
        return this.isSpecialtySelectionValid();
      case 3:
        return this.isProfessionalSelectionValid();
      case 4:
        return this.isScheduleSelectionValid();
      default:
        return false;
    }
  }
  
  private isPatientDataValid(): boolean {
    const userData = this.appointment().userData;
    
    const fieldsValid =
      !!userData.identification_type &&
      !!userData.identification_number &&
      !!userData.first_name &&
      !!userData.phone &&
      !!userData.email;
    
    const optionSelected =
      !!this.appointment().first_time || !!this.appointment().control;
    
    return fieldsValid && optionSelected;
  }
  
  private isSpecialtySelectionValid(): boolean {
    return this.selectedSpecialtyId() !== null;
  }
  
  private isProfessionalSelectionValid(): boolean {
    return this.selectedProfessionalIndex() !== null;
  }
  
  private isScheduleSelectionValid(): boolean {

    const normalValid = this.selectedDayIndex() !== -1 && this.selectedHour() !== '';
    const appointment = this.appointment();
    const manualValid = true;
    return Boolean(normalValid || manualValid);
  }
}
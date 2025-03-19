import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faCrown, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Appointment } from 'src/app/core/interfaces/appointment.interface';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-appointment-assigned',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './appointment-assigned.component.html',
  styleUrls: ['./appointment-assigned.component.scss'],
})
export class AppointmentAssignedComponent {
  @Input() public isPending: boolean = false;
  @Input() public isManual: boolean = false;
  @Input() public patientName: string = '';
  @Input() public professionalName: string = '';
  @Input() public professionalPhone: string = ''; // Añadido para WhatsApp
  @Input() public specialty: string = '';
  @Input() public date: string = '';
  @Input() public time: string = '';
  @Input() public dayOfWeek: string = '';
  @Input() public appointment: Appointment | null = null;
  @Output() public appointmentSaved = new EventEmitter<boolean>();

  public faCheckCircle = faCheckCircle;
  public faCrown = faCrown;
  public faExclamationTriangle = faExclamationTriangle;
  
  constructor(
    private appointmentService: AppointmentService,
    private toastService: ToastService
  ) {}
  
  savePendingAppointment() {
    if (!this.appointment) {
      this.toastService.presentToast('No hay datos de cita para guardar', 'danger');
      return;
    }
    
    const appointmentToSave = {
      ...this.appointment,
      status: 'TO_BE_CONFIRMED'
    };
    
    this.appointmentService.createAppointment(appointmentToSave as Appointment).subscribe({
      next: (response) => {
        this.toastService.presentToast('Cita pendiente guardada exitosamente', 'success');
        this.appointmentSaved.emit(true);
      },
      error: (error) => {
        console.error('Error al guardar la cita pendiente:', error);
        this.toastService.presentToast('Error al guardar la cita pendiente', 'danger');
        this.appointmentSaved.emit(false);
      }
    });
  }
  
  openWhatsApp() {
    const phone = this.professionalPhone || '573043520351';
    const text = `Hola, me gustaría agendar una cita con ${this.professionalName} para la especialidad de ${this.specialty}. El nombre del beneficiario es: ${this.patientName}.`;
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }
}
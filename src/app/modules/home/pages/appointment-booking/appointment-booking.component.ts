// src/app/modules/home/pages/appointment-booking/appointment-booking.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { AppointmentCardComponent } from 'src/app/shared/components/appointment-card/appointment-card.component';
import { HealthProfessionalCardComponent } from 'src/app/shared/components/health-professional-card/health-professional-card.component';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { environment } from 'src/environments/environment';
import { WebsocketService } from 'src/app/core/services/websocket.service';
import { Appointment } from 'src/app/core/interfaces/appointment.interface';
import { Subscription } from 'rxjs';
import { MedicalProfessional } from 'src/app/core/interfaces/medicalProfessional.interface';
import { MedicalProfessionalService } from 'src/app/core/services/medicalProfessional.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TabBarComponent,
    AppointmentCardComponent,
    HealthProfessionalCardComponent,
  ],
  templateUrl: './appointment-booking.component.html',
  styleUrls: ['./appointment-booking.component.scss'],
})
export class AppointmentBookingComponent implements OnInit, OnDestroy {
  public backgroundStyle =
    'url("../../../../../assets/background/background-light.svg") no-repeat bottom center / cover';
  public user: User | any = null;
  public profileImage: string = '';
  public appointments: any[] = [];
  private wsSubscription!: Subscription;

  public professionals: MedicalProfessional[] = [];
  public currentProfessionalIndex = 0;
  public isLoading: boolean = true;

  constructor(
    private userService: UserService,
    private websocketService: WebsocketService,
    private medicalProfessionalService: MedicalProfessionalService,
    private alertController: AlertController,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    // Obtener datos del usuario
    this.userService.user$.subscribe((userData) => {
      this.user =
        Array.isArray(userData) && userData.length > 0 ? userData[0] : userData;
      
      // Establecer imagen de perfil
      if (this.user?.image?.image_path) {
        this.profileImage = `${
          environment.url
        }${this.user.image.image_path.replace(/\\/g, '/')}`;
      } else {
        this.profileImage = 'assets/images/default-profile.png';
      }
    });

    // Conectar al WebSocket y suscribirse a eventos
    this.wsSubscription = this.websocketService.connect().subscribe(
      (data) => {
        console.log('WebSocket data received:', data);
        
        if (data.event === 'user_appointments' && Array.isArray(data.appointments)) {
          this.appointments = this.processAppointments(data.appointments);
          this.isLoading = false;
          console.log('Appointments processed:', this.appointments);
        }
      },
      (error) => {
        console.error('❌ Error en WebSocket:', error);
        this.isLoading = false;
      }
    );

    // Cargar profesionales médicos
    this.medicalProfessionalService.getMedicalProfessionals().subscribe(
      (professionals) => {
        this.professionals = professionals;
      },
      (error) => {
        console.error('Error al cargar profesionales médicos:', error);
      }
    );
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  private processAppointments(appointments: any[]): Appointment[] {
    return appointments.map(appointment => {
      const appDate = new Date(appointment.appointment_date);
      const formattedDate = appDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const dayOfWeek = appDate.toLocaleDateString('es-ES', { weekday: 'long' });

      let formattedTime = appointment.appointment_time;
      if (formattedTime && formattedTime.length >= 5) {
        formattedTime = formattedTime.substring(0, 5);
      }
      
      return {
        ...appointment,
        appointment_date_formatted: formattedDate,
        appointment_time_formatted: formattedTime,
        day: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1) 
      };
    });
  }

  // Maneja la cancelación de una cita
  async confirmCancel(appointmentId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Estás seguro de que deseas cancelar esta cita?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          handler: () => {
            this.cancelAppointment(appointmentId);
          }
        }
      ]
    });

    await alert.present();
  }

  // Cancela una cita
  cancelAppointment(appointmentId: number) {
    this.appointmentService.cancelAppointment(appointmentId).subscribe(
      () => {
        // Eliminar la cita del array local
        this.appointments = this.appointments.filter(
          appointment => appointment.id !== appointmentId
        );
      },
      (error) => {
        console.error('Error al cancelar la cita:', error);
      }
    );
  }

  // Gestiona el scroll en los profesionales
  onScroll(event: any) {
    const element = event.target;
    const scrollWidth = element.scrollWidth;
    const cardWidth = element.offsetWidth;
    const scrollPosition = element.scrollLeft;
    
    // Calcular el índice basado en la posición del scroll
    const totalCards = this.professionals.length;
    const indexRatio = scrollPosition / (scrollWidth - cardWidth);
    this.currentProfessionalIndex = Math.round(indexRatio * (totalCards - 1));
  }

  // Elimina la cita del array local cuando se cancela
  onAppointmentCanceled(canceledId: number) {
    this.appointments = this.appointments.filter(
      (appointment) => appointment.id !== canceledId
    );
  }

  trackByAppointmentId(index: number, appointment: Appointment): number {
    return appointment.id;
  }
}
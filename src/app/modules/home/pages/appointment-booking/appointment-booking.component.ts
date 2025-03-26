// src/app/modules/home/pages/appointment-booking/appointment-booking.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  effect,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
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
    // HealthProfessionalCardComponent,
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
  private appointmentEffectCleanup: any;
  private checkInterval: any;
  private destroyRef = inject(DestroyRef);

  constructor(
    private userService: UserService,
    private websocketService: WebsocketService,
    private medicalProfessionalService: MedicalProfessionalService,
    private alertController: AlertController,
    private appointmentService: AppointmentService,
    private navCtrl: NavController
  ) {
    effect(() => {
      const appointments = this.appointmentService.appointments();

      if (appointments && appointments.length > 0) {
        this.appointments =
          this.appointmentService.processAppointmentDates(appointments);
        this.isLoading = false;
      }
    });
  }

  ngOnInit() {
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
        if (
          data.event === 'user_appointments' &&
          Array.isArray(data.appointments)
        ) {
          this.appointmentService.updateAppointments(data.appointments);

          // Also update component's local state
          this.appointments = this.processAppointments(data.appointments);
          this.isLoading = false;
        } else if (data.event === 'new_appointment') {
          // Handle new appointment notifications
          const newAppointment = this.processAppointments([
            data.appointment,
          ])[0];
          this.appointments = [...this.appointments, newAppointment];

          // Also update service
          this.appointmentService.addAppointment(data.appointment);
        }
      },
      (error) => {
        console.error('❌ Error en WebSocket:', error);
        this.isLoading = false;
        // Show error message to user
        this.presentErrorMessage();
      }
    );

    // Use a simple interval to check for appointments instead of effect()
    this.checkInterval = setInterval(() => {
      const currentAppointments = this.appointmentService.appointments();
      if (currentAppointments && currentAppointments.length > 0) {
        this.appointments =
          this.appointmentService.processAppointmentDates(currentAppointments);
        this.isLoading = false;
        clearInterval(this.checkInterval);
      }
    }, 1000);

    // Added timeout for loading state - in case WebSocket fails without error
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        clearInterval(this.checkInterval);
        if (this.appointments.length === 0) {
          this.presentErrorMessage();
        }
      }
    }, 10000);

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

  goToChat(){
    this.navCtrl.navigateForward('/home/chat');
  }

  async presentErrorMessage() {
    const alert = await this.alertController.create({
      header: 'Error de conexión',
      message:
        'No se pudieron cargar tus citas. Por favor, intenta nuevamente más tarde.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private processAppointments(appointments: any[]): Appointment[] {
    return appointments.map((appointment) => {
      // Skip processing if appointment date is null
      if (!appointment.appointment_date) {
        return {
          ...appointment,
          appointment_date_formatted: 'Fecha por definir',
          appointment_time_formatted: 'Hora por definir',
          day: '',
        };
      }

      try {
        const appDate = new Date(appointment.appointment_date);
        const formattedDate = appDate.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const dayOfWeek = appDate.toLocaleDateString('es-ES', {
          weekday: 'long',
        });

        let formattedTime = appointment.appointment_time || 'Hora por definir';
        if (formattedTime && formattedTime.length >= 5) {
          formattedTime = formattedTime.substring(0, 5);
        }

        return {
          ...appointment,
          appointment_date_formatted: formattedDate,
          appointment_time_formatted: formattedTime,
          day: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1),
        };
      } catch (error) {
        console.error('Error processing appointment date:', error);
        return {
          ...appointment,
          appointment_date_formatted: 'Fecha inválida',
          appointment_time_formatted:
            appointment.appointment_time || 'Hora por definir',
          day: '',
        };
      }
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
          role: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          handler: () => {
            this.cancelAppointment(appointmentId);
          },
        },
      ],
    });

    await alert.present();
  }

  // Cancela una cita
  cancelAppointment(appointmentId: number) {
    this.appointmentService.cancelAppointment(appointmentId).subscribe(
      () => {
        // Eliminar la cita del array local
        this.appointments = this.appointments.filter(
          (appointment) => appointment.id !== appointmentId
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

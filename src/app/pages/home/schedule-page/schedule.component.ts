import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  AlertController,
  LoadingController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

import { MedicalProfessionalService } from 'src/app/core/services/medicalProfessional.service';
import { MedicalSpecialtyService } from 'src/app/core/services/medicalSpecialty.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { MedicalProfessional } from 'src/app/core/interfaces/medicalProfessional.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { User } from 'src/app/core/interfaces/auth.interface';
import { WebsocketService } from 'src/app/core/services/websocket.service';

import { HeaderComponent } from '../../components/home/header/header.component';
import { FollowUsComponent } from '../../components/follow-us/follow-us.component';
import { DoDateComponent } from '../../components/home/do-date/do-date.component';
import { ChatComponent } from 'src/app/modules/home/pages/chat/chat.component';

@Component({
  selector: 'app-schedule',
  imports: [
    HeaderComponent,
    FollowUsComponent,
    DoDateComponent,
    IonicModule,
    CommonModule,
    ChatComponent,
  ],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  isDisabled: boolean = true;
  isEditing: boolean = false;
  isChating: boolean = false;
  isDropdownOpen: boolean = false;
  idProfessional!: number | null;
  selectedSpecialtyName: string = 'Especialidad';
  selectedSpecialtyId = signal<number | null>(null);
  profileImage: string = '';

  private wsSubscription!: Subscription;
  public specialties = computed(() => {
    const data = this.medicalSpecialtyService.specialties();
    return data;
  });
  public professionals: MedicalProfessional[] = [];
  public appointments: any[] = [];
  public user: User | any = null;

  constructor(
    private medicalProfessionalService: MedicalProfessionalService,
    private medicalSpecialtyService: MedicalSpecialtyService,
    private appointmentService: AppointmentService,
    private websocketService: WebsocketService,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.medicalSpecialtyService.fetchMedicalSpecialties().subscribe();

    this.medicalProfessionalService.getMedicalProfessionals().subscribe(
      (professionals) => {
        this.professionals = professionals;
      },
      (error) => {
        this.professionals = [];
      }
    );
    this.userService.user$.subscribe((userData) => {
      this.user =
        Array.isArray(userData) && userData.length > 0 ? userData[0] : userData;
      if (this.user?.image?.image_path) {
        this.profileImage = `${
          environment.url
        }${this.user.image.image_path.replace(/\\/g, '/')}`;
      } else {
        this.profileImage = 'assets/images/default-profile.png';
      }
    });

    this.wsSubscription = this.websocketService.connect().subscribe(
      (data) => {
        if (data.event === 'user_appointments') {
          this.appointments = data.appointments;
        }
      },
      (error) => {
        console.error('❌ Error en WebSocket:', error);
      }
    );
  }

  // ----------------------------- Logica para la card de citas agendadas ----------------------------- //

  async confirmCancel(appointmentId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Estás seguro de que deseas cancelar esta cita?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
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

  cancelAppointment(appointmentId: number) {
    if (!appointmentId) return;

    this.appointmentService.cancelAppointment(appointmentId).subscribe(
      () => {
        this.isEditing = false;
        this.appointments = this.appointments.filter(
          (appointment) => appointment.id !== appointmentId
        );
      },
      (error: any) => {
        console.error('Error al cancelar la cita:', error);
      }
    );
  }

  openWhatsapp = async () => {
    const loading = await this.showLoading();
    try {
      const whatsappUrl =
        'whatsapp://send?phone=573043520351&text=Hola, quiero agendar una cita con el doctor';
      window.location.href = whatsappUrl;

      setTimeout(() => {
        window.open(
          'https://web.whatsapp.com/send?phone=573043520351&text=Hola, quiero agendar una cita con el doctor',
          '_blank'
        );
      }, 500);
      this.closeCard();
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
    } finally {
      if (loading) {
        loading.dismiss();
      }
    }
  };

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Espera un momento, por favor...',
      cssClass: 'custom-loading',
    });

    loading.present();
    return loading;
  }

  // --------------- Acciones de botonoes --------------- //

  toggleDropdown(specialty?: any): void {
    if (specialty) {
      this.selectedSpecialtyName = specialty.name;
      this.selectedSpecialtyId = specialty.id;

      this.medicalProfessionalService
        .fetchMedicalProfessionals(specialty.id)
        .subscribe((professionals) => {
          this.professionals = professionals;
        });

      this.isDropdownOpen = false;
    } else {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  toggleChat(): boolean {
    if (!this.isChating) {
      this.websocketService.resetConnection().subscribe({
        next: () => console.log('Conexión reiniciada correctamente'),
        error: (err) => console.error('Error al reiniciar conexión:', err),
      });
    } else {
      this.websocketService.disconnect();
    }

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
    return this.isDisabled;
  }
}

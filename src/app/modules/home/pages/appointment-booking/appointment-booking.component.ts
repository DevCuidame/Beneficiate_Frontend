import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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
export class AppointmentBookingComponent implements OnInit {
  public backgroundStyle =
    'url("../../../../../assets/background/background-light.svg") no-repeat bottom center / cover';
  public user: User | any = null;
  public profileImage: string = '';
  public appointments: any[] = [];
  private wsSubscription!: Subscription;

  public professionals: MedicalProfessional[] = [];

  public currentProfessionalIndex = 0;

  constructor(
    private userService: UserService,
    private websocketService: WebsocketService,
    private medicalProfessionalService: MedicalProfessionalService
  ) {}

  ngOnInit() {
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
          console.log(
            '🚀 ~ AppointmentBookingComponent ~ ngOnInit ~ this.appointments:',
            this.appointments
          );
        }
      },
      (error) => {
        console.error('❌ Error en WebSocket:', error);
      }
    );
    // Traer los profesionales desde la API
    this.medicalProfessionalService.getMedicalProfessionals().subscribe(
      (professionals) => {
        this.professionals = professionals;
      },
      (error) => {
        this.professionals = [];
      }
    );
  }
  onScroll(event: any) {
    const element = event.target;
    const cardWidth = element.offsetWidth;
    const index = Math.round(element.scrollLeft / cardWidth);
    this.currentProfessionalIndex = index;
  }
}

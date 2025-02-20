import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { AppointmentCardComponent } from 'src/app/shared/components/appointment-card/appointment-card.component';
import { HealthProfessionalCardComponent } from 'src/app/shared/components/health-professional-card/health-professional-card.component';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule, IonicModule, TabBarComponent, AppointmentCardComponent, HealthProfessionalCardComponent],
  templateUrl: './appointment-booking.component.html',
  styleUrls: ['./appointment-booking.component.scss'],
})
export class AppointmentBookingComponent implements OnInit {
  public backgroundStyle =
    'url("../../../../../assets/background/background-light.svg") no-repeat bottom center / cover';
  public user: User | any = null;
  public profileImage: string = '';

  public professionals: any[] = [
    { name: 'Profesional 1', specialty: 'Especialidad 1' },
    { name: 'Profesional 2', specialty: 'Especialidad 2' },
    { name: 'Profesional 3', specialty: 'Especialidad 3' },
  ];

  public currentProfessionalIndex = 0;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.user$.subscribe((userData) => {
      this.user = Array.isArray(userData) && userData.length > 0 ? userData[0] : userData;
      if (this.user?.location && Array.isArray(this.user.location) && this.user.location.length > 0) {
        this.user.location = this.user.location[0];
      }
      if (this.user?.image?.image_path) {
        this.profileImage = `${environment.url}${this.user.image.image_path.replace(/\\/g, '/')}`;
      } else {
        this.profileImage = 'assets/images/default-profile.png';
      }
    });
  }

  onScroll(event: any) {
    const element = event.target;
    const cardWidth = element.offsetWidth; 
    const index = Math.round(element.scrollLeft / cardWidth);
    this.currentProfessionalIndex = index;
  }
}

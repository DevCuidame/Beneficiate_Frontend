import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-profile-info',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './user-profile-info.component.html',
  styleUrls: ['./user-profile-info.component.scss'],
})
export class UserProfileInfoComponent implements OnInit {
  public user: User | null = null;
  public profileImage: string = '';
  private apiUrl = environment.url;
 
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.userService.user$.subscribe(userData => {
      // Si es un array, tomar el primer elemento
      if (Array.isArray(userData) && userData.length > 0) {
        this.user = userData[0];
      } else {
        this.user = userData;
      }

      if (this.user?.image?.image_path) {
        this.profileImage = `${this.apiUrl}${this.user.image.image_path.replace(/\\/g, '/')}`;
      } else {
        this.profileImage = 'assets/images/default-profile.png';
      }
    });
  }

  public goToEditProfile(): void {
    this.router.navigate(['/profile/edit']);
  }
}
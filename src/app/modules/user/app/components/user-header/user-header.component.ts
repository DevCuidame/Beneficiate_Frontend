import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss'],
})
export class UserHeaderComponent implements OnInit {
  public environment = environment.url;
  public user: User | null = null;
  public userImagePath: string = 'assets/images/default-profile.png';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.user$.subscribe((userData) => {
      if (Array.isArray(userData) && userData.length > 0) {
        this.user = userData[0];
      } else {
        this.user = userData;
      }

      if (this.user?.image?.image_path) {
        this.userImagePath = `${this.environment}${this.user.image.image_path.replace(/\\/g, '/')}`;
      } else {
        this.userImagePath = 'assets/images/default-profile.png';
      }
    });
  }
}
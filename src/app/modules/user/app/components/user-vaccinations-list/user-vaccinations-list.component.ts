import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { EditButtonComponent } from 'src/app/shared/components/edit-button/edit-button.component';
import { PrimaryCardComponent } from 'src/app/shared/components/primary-card/primary-card.component';
import { SecondaryCardComponent } from 'src/app/shared/components/secondary-card/secondary-card.component';
import { faSyringe } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-vaccinations-list',
  standalone: true,
  imports: [
    CommonModule, 
    EditButtonComponent, 
    PrimaryCardComponent, 
    SecondaryCardComponent, 
    FontAwesomeModule
  ],
  templateUrl: './user-vaccinations-list.component.html',
  styleUrls: ['./user-vaccinations-list.component.scss'],
})
export class UserVaccinationsListComponent implements OnInit {
  public user: User | null = null;
  public faSyringe = faSyringe;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.user$.subscribe((userData) => {
      if (Array.isArray(userData) && userData.length > 0) {
        this.user = userData[0];
      } else {
        this.user = userData;
      }
    });
    
    // Ensure health data is loaded
    this.userService.getUserHealthData();
  }
}
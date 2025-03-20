import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { EditButtonComponent } from 'src/app/shared/components/edit-button/edit-button.component';
import { PrimaryCardComponent } from 'src/app/shared/components/primary-card/primary-card.component';
import { SecondaryCardComponent } from 'src/app/shared/components/secondary-card/secondary-card.component';
import { faPills } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-medications-allergies-list',
  standalone: true,
  imports: [
    CommonModule, 
    EditButtonComponent, 
    PrimaryCardComponent, 
    SecondaryCardComponent, 
    FontAwesomeModule
  ],
  templateUrl: './user-medications-allergies-list.component.html',
  styleUrls: ['./user-medications-allergies-list.component.scss'],
})
export class UserMedicationsAllergiesListComponent implements OnInit {
  public user: User | null = null;
  public faPills = faPills;

  public severityText: { [key: string]: string } = {
    MILD: 'Leve',
    MODERATE: 'Moderado',
    SEVERE: 'Severo'
  };

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
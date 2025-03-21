import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserHealthService } from 'src/app/core/services/user-health.service';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { EditButtonComponent } from 'src/app/shared/components/edit-button/edit-button.component';
import { PrimaryCardComponent } from 'src/app/shared/components/primary-card/primary-card.component';
import { SecondaryCardComponent } from 'src/app/shared/components/secondary-card/secondary-card.component';

@Component({
  selector: 'app-user-conditions-list',
  imports: [PrimaryCardComponent, CommonModule, EditButtonComponent, SecondaryCardComponent],
  templateUrl: './user-conditions-list.component.html',
  styleUrls: ['./user-conditions-list.component.scss'],
})
export class UserConditionsListComponent implements OnInit {
  public user: User | null = null;

  constructor(private userService: UserService, private userHealthService: UserHealthService) {}

  ngOnInit() {
    this.userService.user$.subscribe((userData) => {
      if (Array.isArray(userData) && userData.length > 0) {
        this.user = userData[0];
      } else {
        this.user = userData;
      }
    });
    
    // Load health data
    this.userHealthService.getUserHealthData();

  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { getLabel, historyTypeOptions, relativeOptions } from 'src/app/core/constants/options';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserHealthService } from 'src/app/core/services/user-health.service';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { EditButtonComponent } from 'src/app/shared/components/edit-button/edit-button.component';
import { PrimaryCardComponent } from 'src/app/shared/components/primary-card/primary-card.component';
import { SecondaryCardComponent } from 'src/app/shared/components/secondary-card/secondary-card.component';

@Component({
  selector: 'app-user-medical-history-list',
  imports: [PrimaryCardComponent, CommonModule, EditButtonComponent, SecondaryCardComponent],
  templateUrl: './user-medical-history-list.component.html',
  styleUrls: ['./user-medical-history-list.component.scss'],
})
export class UserMedicalHistoryListComponent implements OnInit {
  public user: User | null = null;
  public getLabel = getLabel;
  public historyTypeOptions = historyTypeOptions;
  public relativeOptions = relativeOptions;

  constructor(
    private userService: UserService,
    private userHealthService: UserHealthService
  ) {}

  ngOnInit() {
    this.userService.user$.subscribe((userData) => {
      if (Array.isArray(userData) && userData.length > 0) {
        this.user = userData[0];
      } else {
        this.user = userData;
      }
    });
    
    // Ensure health data is loaded
    this.userHealthService.getUserHealthData();

  }
}
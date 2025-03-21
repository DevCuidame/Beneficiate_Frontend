import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IonicModule } from '@ionic/angular';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';

import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { getLabel, historyTypeOptions, relativeOptions } from 'src/app/core/constants/options';


// Importar los componentes de salud para el usuario (estos serán creados posteriormente)
import { UserHealthService } from 'src/app/core/services/user-health.service';
import { HeaderComponent } from 'src/app/pages/components/header/header.component';
import { FooterComponent } from 'src/app/pages/components/footer-component/footer-component.component';
import { CardInfoInputComponent } from 'src/app/pages/components/inputs/card-info-input/card-info-input.component';
import { UserProfileInfoComponent } from '../user-profile-info/user-profile-info.component';
import { UserVacinationsFormComponent } from '../../components/health/vacinations/user-vacinations-form/user-vacinations-form.component';
import { UserMedicalHistoryFormComponent } from '../../components/health/medical-history/user-medical-history-form/user-medical-history-form.component';
import { UserHealthConditionFormComponent } from '../../components/health/health-condition/user-health-condition-form/user-health-condition-form.component';
import { UserMedicamentsAllergiesFormComponent } from '../../components/health/allergies/user-medicaments-allergies-form/user-medicaments-allergies-form.component';

@Component({
  selector: 'app-user-health-info',
  standalone: true,
  imports: [
    FormsModule,
    FontAwesomeModule,
    IonicModule,
    HeaderComponent,
    FooterComponent,
    CardInfoInputComponent,
    UserVacinationsFormComponent,
    UserMedicalHistoryFormComponent,
    UserHealthConditionFormComponent,
    UserMedicamentsAllergiesFormComponent,
    UserProfileInfoComponent
  ],
  templateUrl: './user-health-info.component.html',
  styleUrls: ['./user-health-info.component.scss'],
})
export class UserHealthInfoComponent implements OnInit {
  public user: User | null = null;
  public getLabel = getLabel;
  public faPen = faPen;
  public faTimes = faTimes;
  public historyTypeOptions = historyTypeOptions;
  public relativeOptions = relativeOptions;

  public addVacination: boolean = false;
  public addMedicalHistory: boolean = false;
  public addHealthCondition: boolean = false;
  public addAllergies: boolean = false;

  constructor(
    private userService: UserService,
    private userHealthService: UserHealthService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.userService.user$.subscribe(userData => {
      if (Array.isArray(userData) && userData.length > 0) {
        this.user = userData[0];
      } else {
        this.user = userData;
      }
    });

    // Cargar los datos de salud del usuario (mediante el servicio UserHealthService)
    this.userHealthService.getUserHealthData();
  }

  public severityText(severity: string): string {
    const severityMap: { [key: string]: string } = {
      MILD: 'Leve',
      MODERATE: 'Moderado',
      SEVERE: 'Severo'
    };

    return severityMap[severity] || ' ';
  }

  toggleEdit(field: 'addVacination' | 'addMedicalHistory' | 'addHealthCondition' | 'addAllergies') {
    if (this[field]) {
      this[field] = false;
    } else {
      // Desactiva todos los demás
      this.addVacination = false;
      this.addMedicalHistory = false;
      this.addHealthCondition = false;
      this.addAllergies = false;

      // Activa el seleccionado
      this[field] = true;
    }
  }
}
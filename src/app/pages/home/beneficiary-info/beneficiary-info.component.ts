import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IonicModule } from '@ionic/angular';
import { faPen,faTimes } from '@fortawesome/free-solid-svg-icons';

import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { getLabel, historyTypeOptions, relativeOptions } from 'src/app/core/constants/options';

import { HeaderComponent } from '../../components/home/header/header.component';
import { FollowUsComponent } from '../../components/follow-us/follow-us.component';
import { InfoBeneficiaryComponent } from '../../components/home/info-beneficiary/info-beneficiary.component';
import { CardInfoInputComponent } from '../../components/inputs/card-info-input/card-info-input.component';
import { VacinationsFormComponent } from 'src/app/modules/beneficiary/components/health/vacinations/vacinations-form/vacinations-form.component';
import { MedicalHistoryFormComponent } from 'src/app/modules/beneficiary/components/health/medical-history/medical-history-form/medical-history-form.component';
import { HealthConditionFormComponent } from 'src/app/modules/beneficiary/components/health/health-condition/health-condition-form/health-condition-form.component';
import { MedicamentsAllergiesFormComponent } from 'src/app/modules/beneficiary/components/health/allergies/medicaments-allergies-form/medicaments-allergies-form.component';


@Component({
  selector: 'app-beneficiary-info',
  imports:[
    FormsModule,
    FontAwesomeModule,
    IonicModule,
    HeaderComponent,
    FollowUsComponent,
    InfoBeneficiaryComponent,
    CardInfoInputComponent,
    VacinationsFormComponent,
    MedicalHistoryFormComponent,
    HealthConditionFormComponent,
    MedicamentsAllergiesFormComponent
  ],
  templateUrl: './beneficiary-info.component.html',
  styleUrls: ['./beneficiary-info.component.scss'],
})
export class BeneficiaryInfoComponent  implements OnInit {
  public beneficiary: Beneficiary | undefined;
  public activeBeneficiary: Beneficiary | null = null;
  public getLabel = getLabel;
  public faPen = faPen;
  public faTimes = faTimes;
  public historyTypeOptions = historyTypeOptions;
  public relativeOptions = relativeOptions;

  public addVacination: boolean = false;
  public addMedicalHistory: boolean = false;
  public addHealthCondition: boolean = false;
  public addAllergies: boolean = false;

  constructor(private beneficiaryService: BeneficiaryService) { }

  ngOnInit() {
    this.loadActiveBeneficiary();

    // ----------------- Obtener el historial medico ----------------- //

    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
    });
  }

  private loadActiveBeneficiary(): void {
    const storedBeneficiary = localStorage.getItem('activeBeneficiary');
    this.beneficiary = storedBeneficiary ? JSON.parse(storedBeneficiary) : null;
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

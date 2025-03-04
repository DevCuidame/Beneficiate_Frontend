import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BeneficiaryService } from 'src/app/modules/auth/services/beneficiary.service';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';

import { InfoUserComponent } from '../../components/home/info-user/info-user.component';
import { HeaderComponent } from '../../components/home/header/header.component';
import { FooterComponent } from '../../components/footer-component/footer-component.component';
import { BeneficiaryCardComponent } from '../../components/home/beneficiary-card/beneficiary-card.component';
import { PlanCardComponent } from '../../components/plans-card/plan-card.component';

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    InfoUserComponent,
    HeaderComponent,
    FooterComponent,
    BeneficiaryCardComponent,
    PlanCardComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  selectedButton: string = 'beneficiarios';
  selectedPanel: string = 'beneficiarios';

  public beneficiaries: Beneficiary[] = [];

  public imgPlanFamiliar: string = '../../../../assets/images/Desktop/plan-card-familiar.png';
  public imgPlanIndividual: string = '../../../../assets/images/Desktop/plan-card-individual.png';

  constructor(private beneficiaryService: BeneficiaryService) {}

  ngOnInit() {
    this.beneficiaryService.beneficiaries$.subscribe((beneficiaries) => {
      if (Array.isArray(beneficiaries)) {
        this.beneficiaries = beneficiaries.map((beneficiary) => ({
          ...beneficiary,
          image: Array.isArray(beneficiary.image) && beneficiary.image.length > 0 ? beneficiary.image[0] : null,
        }));
      }
    });
  }

  selectButton(panel: string) {
    console.log('Panel seleccionado:', panel);

    this.selectedButton = panel;
    this.selectedPanel = panel;
  }
}

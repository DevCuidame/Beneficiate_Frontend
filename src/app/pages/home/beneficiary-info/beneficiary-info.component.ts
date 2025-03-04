import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';

import { HeaderComponent } from '../../components/home/header/header.component';
import { FooterComponent } from '../../components/footer-component/footer-component.component';
import { InfoBeneficiaryComponent } from '../../components/home/info-beneficiary/info-beneficiary.component';
import { CardInfoInputComponent } from '../../components/inputs/card-info-input/card-info-input.component';

@Component({
  selector: 'app-beneficiary-info',
  imports:[
    FormsModule,
    HeaderComponent,
    FooterComponent,
    InfoBeneficiaryComponent,
    CardInfoInputComponent,
  ],
  templateUrl: './beneficiary-info.component.html',
  styleUrls: ['./beneficiary-info.component.scss'],
})
export class BeneficiaryInfoComponent  implements OnInit {
  beneficiary: Beneficiary | undefined;

  constructor() { }

  ngOnInit() {
    this.loadActiveBeneficiary();
  }

  private loadActiveBeneficiary(): void {
    const storedBeneficiary = localStorage.getItem('activeBeneficiary');
    this.beneficiary = storedBeneficiary ? JSON.parse(storedBeneficiary) : null;
  }
}

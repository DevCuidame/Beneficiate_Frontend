import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';

import { EditButtonComponent } from 'src/app/shared/components/edit-button/edit-button.component';
import { PrimaryCardComponent } from 'src/app/shared/components/primary-card/primary-card.component';
import { SecondaryCardComponent } from 'src/app/shared/components/secondary-card/secondary-card.component';

@Component({
  selector: 'app-medical-history-list',
  imports: [PrimaryCardComponent, CommonModule, EditButtonComponent, SecondaryCardComponent],

  templateUrl: './medical-history-list.component.html',
  styleUrls: ['./medical-history-list.component.scss'],
})
export class MedicalHistoryListComponent implements OnInit {
  public activeBeneficiary: Beneficiary | null = null;

  constructor(
    private beneficiaryService: BeneficiaryService,
    
  ) {}

  ngOnInit() {
    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
    });
  }
}

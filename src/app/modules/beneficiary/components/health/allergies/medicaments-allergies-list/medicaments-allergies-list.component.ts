import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { EditButtonComponent } from 'src/app/shared/components/edit-button/edit-button.component';
import { PrimaryCardComponent } from 'src/app/shared/components/primary-card/primary-card.component';

@Component({
  selector: 'app-medicaments-allergies-list',
  imports: [PrimaryCardComponent, CommonModule, EditButtonComponent],

  templateUrl: './medicaments-allergies-list.component.html',
  styleUrls: ['./medicaments-allergies-list.component.scss'],
})
export class MedicamentsAllergiesListComponent implements OnInit {
  public activeBeneficiary: Beneficiary | null = null;

  constructor(private beneficiaryService: BeneficiaryService) {}

  ngOnInit() {
    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
    });
  }
}

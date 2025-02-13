import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { EditButtonComponent } from 'src/app/shared/components/edit-button/edit-button.component';
import { PrimaryCardComponent } from 'src/app/shared/components/primary-card/primary-card.component';

@Component({
  selector: 'app-conditions-list',
  imports: [PrimaryCardComponent, CommonModule, EditButtonComponent],
  templateUrl: './conditions-list.component.html',
  styleUrls: ['./conditions-list.component.scss'],
})
export class ConditionsListComponent implements OnInit {
  public activeBeneficiary: Beneficiary | null = null;

  constructor(private beneficiaryService: BeneficiaryService) {}

  ngOnInit() {
    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
    });
    
  }
}

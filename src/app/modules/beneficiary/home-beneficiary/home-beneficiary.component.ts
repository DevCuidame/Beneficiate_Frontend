import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryHeaderComponent } from 'src/app/shared/components/beneficiary-header/beneficiary-header.component';
import { BeneficiaryService } from '../../auth/services/beneficiary.service';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { BasicDataComponent } from 'src/app/shared/components/basic-data/basic-data.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home-beneficiary',
  imports: [
    IonicModule,
    CommonModule,
    BeneficiaryHeaderComponent,
    TabBarComponent,
    BasicDataComponent,
  ],
  templateUrl: './home-beneficiary.component.html',
  styleUrls: ['./home-beneficiary.component.scss'],
})
export class HomeBeneficiaryComponent implements OnInit {
  public activeBeneficiary: Beneficiary | null = null;
  public selectedOption: string = '';
  
  //TODO: Should be imported from other file
  public categories: string[] = [
    'Condiciones',
    'Antecedentes',
    'Medicamentos & Alergias',
    'Vacunas',
  ];
  


  constructor(
    private beneficiaryService: BeneficiaryService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    if (!this.activeBeneficiary === null) {
      this.navCtrl.navigateRoot(['/home/dashboard']);
    }

    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
      console.log(
        '🚀 ~ HomeBeneficiaryComponent ~ this.beneficiaryService.activeBeneficiary$.subscribe ~ this.activeBeneficiary:',
        this.activeBeneficiary
      );
    });
  }


  isSelected(option: string): boolean {
    return this.selectedOption === option;
  }

  selectOption(option: string) {
    this.selectedOption = option;
  }
}

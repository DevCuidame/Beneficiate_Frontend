import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryHeaderComponent } from 'src/app/shared/components/beneficiary-header/beneficiary-header.component';
import { BeneficiaryService } from '../../auth/services/beneficiary.service';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';

@Component({
  selector: 'app-home-beneficiary',
  imports: [IonicModule, BeneficiaryHeaderComponent, TabBarComponent],
  templateUrl: './home-beneficiary.component.html',
  styleUrls: ['./home-beneficiary.component.scss'],
})
export class HomeBeneficiaryComponent implements OnInit {
  public activeBeneficiary: Beneficiary | null = null;

  //TODO: Should be imported from other file

  public categories: string[] = [
    'profile',
    'condición',
    'antecedentes',
    'medAlergias',
    'vacunas',
    'metrics',
  ];
  public iconsNames: string[] = [
    'fa-solid fa-user',
    'fa-solid fa-user-injured',
    'fa-solid fa-notes-medical',
    'fa-solid fa-virus',
    'fa-solid fa-syringe',
    'fa-solid fa-chart-simple',
  ];

  constructor(private beneficiaryService: BeneficiaryService, private navCtrl: NavController) {}

  ngOnInit() {

    if (!this.activeBeneficiary === null) {
      this.navCtrl.navigateRoot(['/home/dashboard'])
    }

    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
    });
  }
}

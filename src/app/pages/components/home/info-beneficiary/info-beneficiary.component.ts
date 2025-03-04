import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IonicModule } from '@ionic/angular';
import {
  faCrown,
  faAddressCard,
  faCakeCandles,
  faHouse,
  faMap,
  faPersonHalfDress,
  faPhone,
  faCity,
  faHeart,
  faHospital,
} from '@fortawesome/free-solid-svg-icons';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';

@Component({
  selector: 'app-info-beneficiary',
  imports: [IonicModule, FontAwesomeModule, CommonModule],
  templateUrl: './info-beneficiary.component.html',
  styleUrls: ['./info-beneficiary.component.scss'],
})
export class InfoBeneficiaryComponent implements OnInit {
  public profileImage: string = '';
  public environment = environment.url;
  public beneficiary: Beneficiary | null = null;

  // Iconos
  public faCrown = faCrown;
  public faAddressCard = faAddressCard;
  public faCakeCandles = faCakeCandles;
  public faHouse = faHouse;
  public faMap = faMap;
  public faPersonHalfDress = faPersonHalfDress;
  public faPhone = faPhone;
  public faCity = faCity;
  public faHeart = faHeart;
  public faHospital = faHospital;

  constructor() {}

  ngOnInit() {
    this.beneficiary = this.loadActiveBeneficiary();

    // Cargar imagen de perfil del beneficiario si existe
    if (this.beneficiary?.image?.image_path) {
      this.profileImage = `${environment.url}${this.beneficiary.image.image_path.replace(/\\/g, '/')}`;
    } else {
      this.profileImage = 'assets/images/default-profile.png';
    }
  }

  private loadActiveBeneficiary(): Beneficiary | null {
    const storedBeneficiary = localStorage.getItem('activeBeneficiary');
    return storedBeneficiary ? JSON.parse(storedBeneficiary) : null;
  }
}

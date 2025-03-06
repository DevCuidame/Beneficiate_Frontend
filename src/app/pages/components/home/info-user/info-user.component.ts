import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { environment } from 'src/environments/environment';
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

import { UserService } from '../../../../modules/auth/services/user.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { User } from 'src/app/core/interfaces/auth.interface';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BasicDataComponent } from 'src/app/shared/components/basic-data/basic-data.component';

@Component({
  selector: 'app-info-user',
  imports: [
    IonicModule,
    FontAwesomeModule,
    BasicDataComponent,
  ],
  templateUrl: './info-user.component.html',
  styleUrls: ['./info-user.component.scss'],
})
export class InfoUserComponent  implements OnInit {
  public profileImage: string = '';
  public environment = environment.url;
  public beneficiaries: Beneficiary[] = [];
  public user: User | null = null;

  // 👇 Definimos las variables para los iconos
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


  constructor(
    private userService: UserService,
    private beneficiaryService: BeneficiaryService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.userService.user$.subscribe((userData) => {
      if (Array.isArray(userData) && userData.length > 0) {
        this.user = userData[0];
      } else {
        this.user = userData;
      }

      if (this.user?.location && Array.isArray(this.user.location) && this.user.location.length > 0) {
        this.user.location = this.user.location[0];
      }
      if (this.user?.image?.image_path) {
        this.profileImage = `${environment.url}${this.user.image.image_path.replace(/\\/g, '/')}`;
      } else {
        this.profileImage = 'assets/images/default-profile.png';
      }
    });

    this.beneficiaryService.beneficiaries$.subscribe((beneficiaries) => {
      if (Array.isArray(beneficiaries)) {
        this.beneficiaries = beneficiaries.map(beneficiary => ({
          ...beneficiary,
          image: (Array.isArray(beneficiary.image) && beneficiary.image.length > 0) ? beneficiary.image[0] : null
        }));
      }
    });

    this.authService.refreshUserData();
  }
}

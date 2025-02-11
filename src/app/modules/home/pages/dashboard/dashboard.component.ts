import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { environment } from 'src/environments/environment';
import { BasicDataComponent } from 'src/app/shared/components/basic-data/basic-data.component';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryService } from 'src/app/modules/auth/services/beneficiary.service';
import { BeneficiaryCardComponent } from 'src/app/shared/components/beneficiary-card/beneficiary-card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, TabBarComponent, BasicDataComponent, BeneficiaryCardComponent, FontAwesomeModule], // Advertencia
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public user: User | any = null;
  public beneficiaries: Beneficiary[] = []; 
  public environment = environment.url;
  public profileImage: string = '';
  public activeTab: string = 'info';
  public selectedButtonText: string = 'Beneficiarios';
  public selectedIndicatorBorder: string = '20px';
  public showCards: boolean = true;
  public faCrown = faCrown;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private beneficiaryService: BeneficiaryService,
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  setInitialSelectedButton() {
    const initialButton = document.getElementById('firstOption');
    if (initialButton) {
      this.selectButton('Beneficiarios');
      this.showCards = true;
    }
  }

  selectButton(buttonType: string) {
    const firstButton = document.getElementById('firstOption');
    const secondButton = document.getElementById('secondOption');
    const selectedIndicator = document.getElementById('selectedIndicator');

    if (buttonType === 'Beneficiarios') {
      this.showCards = true;
      if (selectedIndicator) {
        selectedIndicator.style.left = '0';
        selectedIndicator.textContent = 'Beneficiarios';
      }
      if (firstButton) {
        firstButton.classList.add('active');
        secondButton?.classList.remove('active');
      }
      this.selectedButtonText = 'Beneficiarios';
      this.selectedIndicatorBorder = '20px';
    } else if (buttonType === 'Servicios') {
      this.showCards = false;
      if (selectedIndicator) {
        selectedIndicator.style.left = '50%';
        selectedIndicator.textContent = 'Servicios';
      }
      if (secondButton) {
        secondButton.classList.add('active');
        firstButton?.classList.remove('active');
      }
      this.selectedButtonText = 'Servicios';
      this.selectedIndicatorBorder = '20px';
    }
  }
}

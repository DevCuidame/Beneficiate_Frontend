import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { environment } from 'src/environments/environment';
import { BasicDataComponent } from 'src/app/shared/components/basic-data/basic-data.component';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryCardComponent } from 'src/app/shared/components/beneficiary-card/beneficiary-card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';
import { PrimaryCardComponent } from 'src/app/shared/components/primary-card/primary-card.component';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { Plan } from 'src/app/core/interfaces/plan.interface';
import { PlanSelectionComponent } from 'src/app/shared/components/plan-selection/plan-selection/plan-selection.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TabBarComponent,
    BasicDataComponent,
    BeneficiaryCardComponent,
    FontAwesomeModule,
    PrimaryCardComponent,
    PlanSelectionComponent
  ], // Advertencia
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
    private cdRef: ChangeDetectorRef,
    private navController: NavController
  ) {}
  ngOnInit() {
    this.userService.user$.subscribe((userData) => {

      this.user = userData;
      this.cdRef.detectChanges();

      if (Array.isArray(userData) && userData.length > 0) {
        this.user = userData[0];
      } else {
        this.user = userData;

      }

      if (
        this.user?.location &&
        Array.isArray(this.user.location) &&
        this.user.location.length > 0
      ) {
        this.user.location = this.user.location[0];
      }
      if (this.user?.image?.image_path) {
        this.profileImage = `${
          environment.url
        }${this.user.image.image_path.replace(/\\/g, '/')}`;
      } else {
        this.profileImage = 'assets/images/default-profile.png';
      }
    });

    this.beneficiaryService.beneficiaries$.subscribe((beneficiaries) => {
      if (Array.isArray(beneficiaries)) {
        this.beneficiaries = beneficiaries.map((beneficiary) => ({
          ...beneficiary,
          image:
            Array.isArray(beneficiary.image) && beneficiary.image.length > 0
              ? beneficiary.image[0]
              : null,
        }));
      }
      this.cdRef.detectChanges();
    });

    this.authService.refreshUserData();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

    // Método para manejar la selección de plan
    onPlanSelected(plan: any) {
      console.log('Plan seleccionado:', plan);
      // Puedes agregar lógica adicional aquí si es necesario
    }

  selectButton(buttonType: string) {
    if(this.user.plan ){
      if (buttonType === 'Agenda') {
        this.navController.navigateForward(['/home/appointment-booking']);
      }
    }
  }
}

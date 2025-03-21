import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { User } from 'src/app/core/interfaces/auth.interface';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { Plan } from 'src/app/core/interfaces/plan.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-beneficiary-card',
  imports: [IonicModule],
  templateUrl: './beneficiary-card.component.html',
  styleUrls: ['./beneficiary-card.component.scss'],
})
export class BeneficiaryCardComponent implements OnInit {
  @Input() beneficiaries: Beneficiary[] = [];
  public environment = environment.url;
  public beneficiaryCount: number = 0;
  public maxBeneficiaries: number = 5;
  @Input() plan?: Plan;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private beneficiaryService: BeneficiaryService,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
    this.beneficiaryService.beneficiaryCount$.subscribe((count) => {
      this.beneficiaryCount = count;
    });

    this.beneficiaryService.maxBeneficiaries$.subscribe((max) => {
      this.maxBeneficiaries = max;
    });
  }

  goToBeneficiary(beneficiary: Beneficiary) {
    this.beneficiaryService.setActiveBeneficiary({...beneficiary})
    this.navCtrl.navigateForward(['/beneficiary/home'])
  }

  get sortedBeneficiaries(): Beneficiary[] {
    return [...this.beneficiaries].sort((a, b) =>
      a.first_name.localeCompare(b.first_name)
    );
  }
  
  get isIndividualPlan(): boolean {
    return this.plan?.code?.includes('INDIVIDUAL') || false;
  }

  get hasPlan(): boolean {
    return !!this.plan;
  }

  async createBeneficiary() {
    // Check if plan is individual

    if (!this.hasPlan) {
      const alert = await this.alertCtrl.create({
        header: 'Plan no disponible',
        message: 'Necesitas un plan activo para agregar beneficiarios.',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }

    if (this.isIndividualPlan) {
      const alert = await this.alertCtrl.create({
        header: 'Plan Individual',
        message: 'No puedes agregar beneficiarios porque tienes un plan individual.',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }

    // Check maximum beneficiaries for family plan
    if (this.beneficiaryCount >= this.maxBeneficiaries) {
      const alert = await this.alertCtrl.create({
        header: 'Límite alcanzado',
        message: `Has alcanzado el número máximo de ${this.maxBeneficiaries} beneficiarios.`,
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }
  
    this.router.navigate(['/beneficiary/add'], { queryParams: { new: true } });
  }
}
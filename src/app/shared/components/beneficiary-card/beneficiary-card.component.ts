import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { environment } from 'src/environments/environment';
import { BeneficiaryService } from 'src/app/modules/auth/services/beneficiary.service';

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
  public maxBeneficiaries: number = 5; // 👈 Se actualizará dinámicamente

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private beneficiaryService: BeneficiaryService
  ) {}

  ngOnInit() {
    this.beneficiaryService.beneficiaryCount$.subscribe((count) => {
      this.beneficiaryCount = count;
    });

    this.beneficiaryService.maxBeneficiaries$.subscribe((max) => {
      this.maxBeneficiaries = max;
    });
  }

  goToBeneficiary(id: number) {
    console.log(`Navegando a beneficiario: ${id}`);
    // Aquí puedes agregar la navegación a la vista del beneficiario
  }

  async createBeneficiary() {
    if (this.beneficiaryCount >= this.maxBeneficiaries) {
      const alert = await this.alertCtrl.create({
        header: 'Límite alcanzado',
        message: `Has alcanzado el número máximo de ${this.maxBeneficiaries} beneficiarios.`,
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    this.router.navigate(['/beneficiary/add']);
  }
}

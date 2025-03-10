import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { environment } from 'src/environments/environment';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';

@Component({
  selector: 'app-beneficiary-card',
  imports: [IonicModule],
  templateUrl: './beneficiary-card.component.html',
  styleUrls: ['./beneficiary-card.component.scss'],
})
export class BeneficiaryCardComponent implements OnInit {
  @Input() isIndividual: boolean = false;
  public beneficiaries: Beneficiary[] = [];
  public activeBeneficiary: Beneficiary | null = null;

  public environment = environment.url;
  public beneficiaryCount: number = 0;
  public maxBeneficiaries: number = 5;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private beneficiaryService: BeneficiaryService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    // Obtener los beneficiarios desde el servicio
    this.beneficiaryService.beneficiaries$.subscribe((beneficiaries) => {
      if (Array.isArray(beneficiaries)) {
        this.beneficiaries = beneficiaries.map((beneficiary) => ({
          ...beneficiary,
          image: (Array.isArray(beneficiary.image) && beneficiary.image.length > 0) ? beneficiary.image[0] : null,
        }));
      }
    });

    // Obtener el contador de beneficiarios desde el servicio
    this.beneficiaryService.beneficiaryCount$.subscribe((count) => {
      this.beneficiaryCount = count;
    });

    // Obtener el máximo número de beneficiarios permitidos desde el servicio
    this.beneficiaryService.maxBeneficiaries$.subscribe((max) => {
      this.maxBeneficiaries = max;
    });
  }

  // Redirigir a los detalles de un beneficiario
  goToBeneficiary(beneficiary: Beneficiary) {
    this.beneficiaryService.setActiveBeneficiary(beneficiary);
    this.navCtrl.navigateForward(['/home-desktop/beneficiary-info']); // Aquí puedes modificar el destino de la navegación
  }

  // Crear un nuevo beneficiario
  async createBeneficiary() {

    if (this.isIndividual) {
      const alert = await this.alertCtrl.create({
        header: 'Plan Individual',
        message: 'No puedes agregar beneficiarios porque tienes un plan individual.',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }

    if (this.beneficiaryCount >= this.maxBeneficiaries) {
      const alert = await this.alertCtrl.create({
        header: 'Límite alcanzado',
        message: `Has alcanzado el número máximo de ${this.maxBeneficiaries} beneficiarios.`,
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    this.router.navigate(['/home-desktop/add']);
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
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

  constructor(private router: Router) {}

  ngOnInit() {}

  goToBeneficiary(id: number) {
    console.log(`Navegando a beneficiario: ${id}`);
    // Aquí puedes agregar la navegación a la vista del beneficiario
  }

  createBeneficiary() {
    this.router.navigate(['/beneficiary/add']);
  }
}

import { Services } from 'src/app/core/interfaces/services.interface';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-service-card',
  imports: [IonicModule],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss'],
})
export class ServiceCardComponent {
  @Input() services: Services[] = [];
  public environment = environment.url;

  constructor() { }

  openService(whatsappLink: string) {
    window.open(whatsappLink, '_blank');
  }

}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Services } from 'src/app/core/interfaces/services.interface';
import { BeneficiaryHeaderComponent } from 'src/app/shared/components/beneficiary-header/beneficiary-header.component';
import { ServiceCardComponent } from 'src/app/shared/components/service-card/service-card.component';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';

@Component({
  selector: 'app-services-list',
  imports: [CommonModule, IonicModule, TabBarComponent, ServiceCardComponent, BeneficiaryHeaderComponent],
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss'],
})
export class ServicesListComponent implements OnInit {
  public services: Services[] = [];

  constructor() {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    try {
      const storedServices = localStorage.getItem('services');
      this.services = storedServices ? JSON.parse(storedServices) : [];
    } catch (error) {
      console.error('Error al obtener los servicios:', error);
      this.services = [];
    }
  }
  
}

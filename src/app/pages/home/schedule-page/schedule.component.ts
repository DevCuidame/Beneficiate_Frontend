import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { HeaderComponent } from '../../components/home/header/header.component';
import { FooterComponent } from '../../components/footer-component/footer-component.component';
import { DoDateComponent } from '../../components/home/do-date/do-date.component';

@Component({
  selector: 'app-schedule',
  imports: [
    HeaderComponent,
    FooterComponent,
    DoDateComponent,
    IonicModule,
    CommonModule,
  ],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent  implements OnInit {
  isDisabled: boolean = true;
  isEditing: boolean = false;
  phoneNumber: string = '3195752651';
  message: string = '¡Hola! Quiero saber más sobre tus servicios.';

  constructor() { }

  ngOnInit() {}

  toggleEdit() {
    this.isEditing = !this.isEditing; // Alterna el valor de isEditing
  }

  toggleCard() {
    this.isDisabled = !this.isDisabled;
  }

  closeCard() {
    this.isDisabled = true;
  }

}

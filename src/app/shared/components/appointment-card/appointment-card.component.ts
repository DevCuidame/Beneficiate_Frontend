import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PrimaryCardComponent } from '../primary-card/primary-card.component';

@Component({
  selector: 'app-appointment-card',
  imports: [CommonModule, IonicModule, PrimaryCardComponent],

  templateUrl: './appointment-card.component.html',
  styleUrls: ['./appointment-card.component.scss'],
})
export class AppointmentCardComponent implements OnInit {
  public edit_button: boolean = false;
  constructor() {}

  ngOnInit() {}

  edit(){
    this.edit_button = !this.edit_button;
  }
}

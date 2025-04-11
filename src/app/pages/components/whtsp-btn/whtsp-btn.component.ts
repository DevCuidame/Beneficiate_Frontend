import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-whatsapp-btn',
  imports: [ IonicModule, CommonModule ],
  templateUrl: './whtsp-btn.component.html',
  styleUrls: ['./whtsp-btn.component.scss'],
})
export class whatsappBtnComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  openWhatsapp = () => {
    const whatsappUrl =
      'whatsapp://send?phone=573043520351&text=Buenos dias, quiero saber más sobre los servicios de Benefíciate.';
    window.location.href = whatsappUrl;

    setTimeout(() => {
      window.open(
        'https://web.whatsapp.com/send?phone=573043520351&text=Buenos dias, quiero saber más sobre los servicios de Benefíciate',
        '_blank'
      );
    }, 500);
  }
}
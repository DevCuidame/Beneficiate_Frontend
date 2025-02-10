import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/core/interfaces/auth.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faAddressCard,
  faCakeCandles,
  faHouse,
  faMap,
  faPersonHalfDress,
  faPhone,
  faCity,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-basic-data',
  templateUrl: './basic-data.component.html',
  styleUrls: ['./basic-data.component.scss'],
  standalone: true,
  imports: [FontAwesomeModule],
})
export class BasicDataComponent implements OnInit {
  @Input() public user: User | null = null;

  // 👇 Definimos las variables para los iconos
  public faAddressCard = faAddressCard;
  public faCakeCandles = faCakeCandles;
  public faHouse = faHouse;
  public faMap = faMap;
  public faPersonHalfDress = faPersonHalfDress;
  public faPhone = faPhone;
  public faCity = faCity;

  constructor() {}

  ngOnInit() {}
}

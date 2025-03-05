import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-speciality-card',
  imports: [CommonModule],

  templateUrl: './speciality-card.component.html',
  styleUrls: ['./speciality-card.component.scss'],
})
export class SpecialityCardComponent implements OnInit {
  @Input() speciality: string = 'Prueba';
  @Input() image!: string;

  public api = environment.url;

  constructor() {}

  ngOnInit() {}
}

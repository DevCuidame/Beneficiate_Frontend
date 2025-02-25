import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-speciality-card',
  imports: [CommonModule],

  templateUrl: './speciality-card.component.html',
  styleUrls: ['./speciality-card.component.scss'],
})
export class SpecialityCardComponent implements OnInit {
    @Input() speciality: string = 'Prueba';
  
  constructor() {}

  ngOnInit() {}
}

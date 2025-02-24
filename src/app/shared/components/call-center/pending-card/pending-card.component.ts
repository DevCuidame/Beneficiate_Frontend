import { Component, Input, OnInit } from '@angular/core';
import { CustomButtonComponent } from '../../custom-button/custom-button.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';  

@Component({
  selector: 'app-pending-card',
  imports: [CustomButtonComponent, CommonModule, FontAwesomeModule],
  templateUrl: './pending-card.component.html',
  styleUrls: ['./pending-card.component.scss'],
})
export class PendingCardComponent implements OnInit {
  @Input() color: string = '';
  public buttonBackground: string = 'assets/background/primary_button_bg.svg';
  public faClock = faClock

  constructor() {}

  ngOnInit() {}
}

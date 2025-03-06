import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PendingCardComponent } from 'src/app/shared/components/call-center/pending-card/pending-card.component';
import { SearchBarComponent } from 'src/app/shared/components/call-center/search-bar/search-bar.component';

@Component({
  selector: 'app-daily-appointments',
  imports: [FontAwesomeModule, CommonModule, SearchBarComponent],

  templateUrl: './daily-appointments.component.html',
  styleUrls: ['./daily-appointments.component.scss'],
})
export class DailyAppointmentsComponent  implements OnInit {
  

  items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];


  constructor() { }

  ngOnInit() {}

}

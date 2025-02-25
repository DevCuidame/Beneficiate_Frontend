import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PendingCardComponent } from 'src/app/shared/components/call-center/pending-card/pending-card.component';
import { SearchBarComponent } from 'src/app/shared/components/call-center/search-bar/search-bar.component';

@Component({
  selector: 'app-appointment-assignment',
  imports: [PendingCardComponent, FontAwesomeModule, SearchBarComponent],
  templateUrl: './appointment-assignment.component.html',
  styleUrls: ['./appointment-assignment.component.scss'],
})
export class AppointmentAssignmentComponent implements OnInit {

  items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  constructor() { }

  ngOnInit() {}


}

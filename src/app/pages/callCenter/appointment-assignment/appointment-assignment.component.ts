import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PendingCardComponent } from 'src/app/shared/components/call-center/pending-card/pending-card.component';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-appointment-assignment',
  imports: [PendingCardComponent, FontAwesomeModule],
  templateUrl: './appointment-assignment.component.html',
  styleUrls: ['./appointment-assignment.component.scss'],
})
export class AppointmentAssignmentComponent implements OnInit {
  public faFilter = faFilter;
  public showDropdown = false;

  items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  constructor() { }

  ngOnInit() {}

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
}

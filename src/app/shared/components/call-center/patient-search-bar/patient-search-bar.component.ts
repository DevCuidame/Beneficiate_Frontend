import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-patient-search-bar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './patient-search-bar.component.html',
  styleUrls: ['./patient-search-bar.component.scss']
})
export class PatientSearchBarComponent {
  public faSearch = faSearch;

  public patientName: string = 'Antonia Malagón';
  public appointmentType: string = 'Cita de control';
  public patientPhotoUrl: string = 'assets/images/patient-photo.jpg';
}

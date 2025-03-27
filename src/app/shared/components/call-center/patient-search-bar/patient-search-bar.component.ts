import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-patient-search-bar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './patient-search-bar.component.html',
  styleUrls: ['./patient-search-bar.component.scss'],
})
export class PatientSearchBarComponent {
  @Input() public first_name: string = '';
  @Input() public last_name: string = '';
  @Input() public image_path: string = '';
  @Input() public firstTime: boolean = false;
  @Input() public cityName: string = '';
  @Input() public ticketNumber: string = '';

  @Output() searchTermChanged = new EventEmitter<string>();

  public environment = environment.url;

  public faSearch = faSearch;

  onSearchTermChange(event: any) {
    this.searchTermChanged.emit(event.target.value);
  }
}

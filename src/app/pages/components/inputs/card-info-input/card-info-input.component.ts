import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IonicModule } from '@ionic/angular';
import { faPen, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-card-info-input',
  imports: [ CommonModule, IonicModule, FontAwesomeModule, FormsModule, ],
  templateUrl: './card-info-input.component.html',
  styleUrls: ['./card-info-input.component.scss'],
})
export class CardInfoInputComponent implements OnInit {
  public faPen = faPen;
  public faSave = faSave;
  public faTimes = faTimes;
  public isEditing: boolean = false;

  @Input() title: string = '';
  @Input() info: string = '';
  @Input() optionalInfo: string = '';

  constructor() {}

  ngOnInit() {}

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }
}

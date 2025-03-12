// message.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Message } from 'src/app/core/interfaces/message.interface';

@Component({
  selector: 'app-message',
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
  @Input() message!: Message;
  @Output() optionSelected = new EventEmitter<string>();
  @Input() optionDisabled: boolean = false;

  onSelectOption(option: string) {
    if (this.optionDisabled) {
      return;
    }
    this.optionSelected.emit(option);
  }
}

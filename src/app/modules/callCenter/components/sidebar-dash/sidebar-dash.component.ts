import { CustomButtonComponent } from './../../../../shared/components/custom-button/custom-button.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar-dash',
  imports: [CommonModule, CustomButtonComponent],
  templateUrl: './sidebar-dash.component.html',
  styleUrls: ['./sidebar-dash.component.scss'],
})
export class SidebarDashComponent implements OnInit {
  activeButton: string = 'assigment';

  constructor() {}

  ngOnInit() {}

    setActive(button: string) {
      this.activeButton = button;
    }
}

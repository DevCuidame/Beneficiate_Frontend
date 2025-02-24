import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderDashComponent } from '../header-dash/header-dash.component';
import { SidebarDashComponent } from '../sidebar-dash/sidebar-dash.component';

@Component({
  selector: 'app-containter-dash',
  imports: [CommonModule, RouterModule, HeaderDashComponent, SidebarDashComponent],
  templateUrl: './containter-dash.component.html',
  styleUrls: ['./containter-dash.component.scss'],
})
export class ContainterDashComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}

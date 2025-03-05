import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/core/interfaces/auth.interface';

@Component({
  selector: 'app-header-dash',
  templateUrl: './header-dash.component.html',
  styleUrls: ['./header-dash.component.scss'],
})
export class HeaderDashComponent  implements OnInit {
  @Input() user: User | any = null;
  @Input() profileImage: string = '';

  constructor() { }

  ngOnInit() {}


}

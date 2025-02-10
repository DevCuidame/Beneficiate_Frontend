import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/core/interfaces/auth.interface';

@Component({
  selector: 'app-basic-data',
  templateUrl: './basic-data.component.html',
  styleUrls: ['./basic-data.component.scss'],
})

export class BasicDataComponent  implements OnInit {

  @Input() public user: User | null = null;
  constructor() { }
  
  ngOnInit() {

  }

}

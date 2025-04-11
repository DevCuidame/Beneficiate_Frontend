import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Input } from '@angular/core';

@Component({
  selector: 'app-follow-us',
  imports: [ IonicModule, CommonModule ],
  templateUrl: './follow-us.component.html',
  styleUrls: ['./follow-us.component.scss'],
})
export class FollowUsComponent  implements OnInit {
  @Input() isFooter: boolean = false;

  constructor() { }

  ngOnInit() {}

}
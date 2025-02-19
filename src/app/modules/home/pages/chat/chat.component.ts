import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, IonicModule, TabBarComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent  implements OnInit {
  public backgroundStyle =
  'url("../../../../../assets/background/background.svg") no-repeat bottom center / cover';

  constructor() { }

  ngOnInit() {}

}

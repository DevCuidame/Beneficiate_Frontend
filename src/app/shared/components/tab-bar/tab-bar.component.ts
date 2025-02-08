import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})
export class TabBarComponent {
  @Input() isVisible: boolean = true; // Controla si la barra se muestra
  @Input() buttons: { icon: string; route: string; visible: boolean }[] = [];
  @Input() background: string = '';

  constructor(private router: Router) {}

  navigate(route: string) {
    if (route) {
      this.router.navigate([route]);
    }
  }
}

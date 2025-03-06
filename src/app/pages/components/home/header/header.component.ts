import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() addBackground: boolean = false;

  constructor(private router: Router) {}

  navigateToHome() {
    this.router.navigate(['/home-desktop/']);
  }

  navigateToSchedule() {
    this.router.navigate(['/home-desktop/schedule']);
  }
}

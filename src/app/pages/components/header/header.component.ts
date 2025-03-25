import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
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
    this.router.navigate(['/desktop/']);
  }

  navigateToAboutUs() {
    this.router.navigate(['/desktop/about-us']);
  }

  navigateToWorkWithUs() {
    this.router.navigate(['/desktop/work-with-us']);
  }
}

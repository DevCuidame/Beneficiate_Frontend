import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonicModule,
  MenuController
} from '@ionic/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() addBackground: boolean = false;
  width: number = 0;

  constructor(
    private router: Router,
    private menuCtrl: MenuController
  ) {}

  ngOnInit(): void {
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.getScreenSize();
  }

  getScreenSize() {
    this.width = window.innerWidth;
  }

  closeMenu() {
    this.menuCtrl.close('main-menu');
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

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

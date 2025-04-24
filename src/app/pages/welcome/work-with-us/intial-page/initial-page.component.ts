import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
  selector: 'app-initial-page',
  standalone: true,
    imports: [
      CommonModule,
      HeaderComponent,
      FooterComponent,
    ],
  templateUrl: './initial-page.component.html',
  styleUrls: ['./initial-page.component.scss'],
})
export class InitialPageComponent  implements OnInit {
  width: number = 0;

  constructor(private router: Router, ) { }

  ngOnInit() {
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.getScreenSize();
  }

  getScreenSize() {
    this.width = window.innerWidth;
  }

  navigateToForm() {
    this.router.navigate(['/desktop/work-with-us/form']);
  }
}

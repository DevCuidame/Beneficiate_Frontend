import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FollowUsComponent } from '../follow-us/follow-us.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ IonicModule, FollowUsComponent ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent  implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {}

  navigateToHome() {
    this.router.navigate(['/desktop/']);
  }

  navigateToAboutUs() {
    this.router.navigate(['/desktop/about-us']);
  }

  navigateToLogin() {
    this.router.navigate(['/desktop/login']);
  }

}

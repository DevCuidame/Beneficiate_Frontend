import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoginComponent } from '../../pages/login/login.component';
import { RegisterComponent } from '../../pages/register/register.component';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';

@Component({
  selector: 'app-auth-container',
  standalone: true,
  imports: [CommonModule, IonicModule, LoginComponent, RegisterComponent, TabBarComponent],
  templateUrl: './auth-container.component.html',
  styleUrls: ['./auth-container.component.scss']
})
export class AuthContainerComponent {
  isLoginView = true; 

  toggleView() {
    this.isLoginView = !this.isLoginView;
  }

  switchToLogin() {
    this.isLoginView = true; 
  }
}

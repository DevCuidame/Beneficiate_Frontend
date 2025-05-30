import { UserService } from './../../../../modules/auth/services/user.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertController, IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    IonicModule
  ],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() addBackground: boolean = false;
  @Input() noPlan: boolean = false;
  showProfileMenu: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController,
    public userService: UserService
  ) {
    const accountType = this.userService.getAccountType();
  }

  ngOnInit() {
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  navigateToHome() {
    this.router.navigate(['/home-desktop/']);
  }

  navigateToSchedule() {
    this.router.navigate(['/home-desktop/schedule']);
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  hideMenu() {
    setTimeout(() => {
      this.showProfileMenu = false;
    }, 100);
  }

  async confirmLogout() {
    this.showProfileMenu = false;

    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button'
        },
        {
          text: 'Confirmar',
          cssClass: 'confirm-button',
          handler: () => {
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

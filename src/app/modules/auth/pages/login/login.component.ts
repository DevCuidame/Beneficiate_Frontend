// src/app/modules/auth/pages/login/login.page.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  LoadingController,
  AlertController,
  IonicModule,
  NavController,
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CustomButtonComponent,
  ], // 👈 Importando IonicModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public loginForm: FormGroup;
  public passwordVisible: boolean = false;
  public buttonBackground: string = 'assets/background/primary_button_bg.svg';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    public navCtrl: NavController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  async login() {
    if (this.loginForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Iniciando sesión...',
      });
      await loading.present();

      this.authService.login(this.loginForm.value).subscribe(
        async (response) => {
          await loading.dismiss();
          // this.navCtrl.navigateRoot('/home/dashboard');

          // Solution to the redirect problem

          // this.router.navigateByUrl('/home/dashboard');

          // Solution to the redirect problem
          // window.location.href = '/home';

        },
        async (error) => {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Error',
            message: 'Credenciales incorrectas',
            buttons: ['OK'],
          });
          await alert.present();
        }
      );
    }
  }
}

import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
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
import { AuthService } from '../../../modules/auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { CustomInputComponent } from 'src/app/pages/components/inputs/custom-input/custom-input.component';
import { HeaderComponent } from 'src/app/pages/components/header/header.component';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponent,
    CustomInputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
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

  get email(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
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
          setTimeout(() => {
            this.router.navigateByUrl('/home/dashboard');
          }, 100);
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

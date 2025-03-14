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
import { AuthService } from '../../../../modules/auth/services/auth.service';
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

  navigateToChangePassword() {
    this.router.navigate(['/desktop/change-password']);
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
            if (!response.data.user.agentActive) {
              this.router.navigateByUrl('/home-desktop');
            } else {
              this.router.navigateByUrl('/call-center/dash/assigment');
            }
          }, 100);
        },
        async (error) => {
          await loading.dismiss();
          
          let errorMessage = 'Credenciales incorrectas';
          
          if (error.error && error.error.error) {
            errorMessage = error.error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          if (errorMessage.includes('verifica tu correo') || 
              errorMessage.toLowerCase().includes('email verification') ||
              (error.status === 401 && errorMessage.includes('correo'))) {
            this.showVerificationAlert(this.loginForm.value.email);
          } else {
            const alert = await this.alertCtrl.create({
              header: 'Error',
              message: errorMessage,
              buttons: ['OK'],
            });
            await alert.present();
          }
        }
      );
    }
  }

  /**
   * Muestra un diálogo específico para errores de verificación de correo
   */
  async showVerificationAlert(email: string) {
    const alert = await this.alertCtrl.create({
      header: 'Verificación Pendiente',
      message: `Por favor verifica tu correo electrónico para continuar. Hemos enviado un enlace de verificación a ${email}`,
      cssClass: 'verification-alert-modal',
      buttons: [
        {
          text: 'Reenviar Correo',
          handler: () => {
            this.resendVerificationEmail(email);
          }
        },
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    
    await alert.present();
  }

  /**
   * Reenvía el correo de verificación
   */
  resendVerificationEmail(email: string) {
    // Muestra un loading
    this.loadingCtrl.create({
      message: 'Reenviando correo de verificación...'
    }).then(loading => {
      loading.present();
      
      // Llama al servicio para reenviar el correo
      this.authService.resendVerificationEmail(email).subscribe(
        async () => {
          loading.dismiss();
          const successAlert = await this.alertCtrl.create({
            header: 'Correo Enviado',
            message: 'Hemos reenviado el correo de verificación. Por favor revisa tu bandeja de entrada.',
            buttons: ['OK']
          });
          await successAlert.present();
        },
        async (error) => {
          loading.dismiss();
          const errorAlert = await this.alertCtrl.create({
            header: 'Error',
            message: 'No pudimos reenviar el correo de verificación. Por favor intenta más tarde.',
            buttons: ['OK']
          });
          await errorAlert.present();
        }
      );
    });
  }
}
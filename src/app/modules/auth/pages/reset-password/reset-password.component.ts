// src/app/modules/auth/pages/reset-password/reset-password.page.ts
import { Component, ViewEncapsulation  } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  LoadingController,
  IonicModule,
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CustomButtonComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ResetPasswordComponent {
  public buttonBackground: string = 'assets/background/primary_button_bg.svg';
  resetPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
  ) {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async resetPassword() {
    if (this.resetPasswordForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Verificado...',
      });
      await loading.present();

      /*
      this.authService.login(this.resetPasswordForm.value).subscribe(

      );
      */
    }
  }
}


// src/app/modules/auth/pages/register/register.page.ts
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterData } from 'src/app/core/interfaces/auth.interface';
import { AlertController, LoadingController } from '@ionic/angular';
import { debounceTime } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, CustomButtonComponent], // 👈 Importando IonicModule
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],

})
export class RegisterComponent {
  @Output() registerSuccess = new EventEmitter<void>();
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  registerForm: FormGroup;
  public buttonBackground: string = 'assets/background/primary_button_bg.svg';
  public selectedImage: string | ArrayBuffer | null = null;
  public file_pub_name: any;



  errorMessages: any = {
    first_name: 'El nombre solo puede contener letras.',
    last_name: 'El apellido solo puede contener letras.',
    identification_number: 'Debe ser un número válido.',
    phone: 'Debe ser un número de teléfono válido.',
    email: 'Ingrese un correo electrónico válido.',
    password: 'La contraseña debe contener al menos 8 caracteres, una mayúscula y un número.',
    confirmPassword: 'Las contraseñas no coinciden.'
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      last_name: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      identification_type: ['', Validators.required],
      identification_number: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      address: ['', Validators.required],
      city: [null, Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9-]+$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$')
      ]],
      confirmPassword: ['', [Validators.required]],
      public_name: ['', Validators.maxLength(50)],
      base_64: [''],
      privacy_policy: [false, Validators.requiredTrue]
    }, { validator: this.passwordMatchValidator });

    this.setupRealTimeValidation();
  }

  ngAfterViewInit() {

  }

  setupRealTimeValidation() {
    this.registerForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.registerForm.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  getErrorMessage(field: string): string | null {
    if (this.registerForm.get(field)?.invalid && this.registerForm.get(field)?.touched) {
      return this.errorMessages[field];
    }
    return null;
  }

  async register() {
    if (this.registerForm.valid) {
      const loading = await this.loadingCtrl.create({ message: 'Registrando...' });
      await loading.present();
      const { confirmPassword, ...registerData } = this.registerForm.value;

      const registerPayload = {
        ...registerData,
        city_id: registerData.city.id, 
      };
      delete registerPayload.city;
      
      this.authService.register(registerPayload as RegisterData).subscribe(
        async () => {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Registro exitoso',
            message: 'Tu cuenta ha sido creada con éxito. Por favor, revisa tu correo.',
            buttons: ['OK']
          });
          await alert.present();
          this.registerSuccess.emit();
        },
        async (error) => {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Error en el registro',
            message: 'Hubo un problema al crear la cuenta. Inténtalo de nuevo.',
            buttons: ['OK']
          });
          await alert.present();
          console.error('Error en el registro:', error);
        }
      );
    }
  }


  // Image Controller

  selectImage() {
    document.getElementById('imageInput')?.click();
  }

  async onImageSelected(event: any) {
    const file = event.target.files[0];
  
    if (!file) return;
  
    // Validar tipo de archivo (aceptamos HEIC, JPEG, PNG y GIF)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      const alert = await this.alertCtrl.create({
        header: 'Formato no válido',
        message: 'Solo se permiten imágenes en formato JPG, PNG, GIF o HEIC.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
  
    // Validar tamaño (máximo 2MB)
    const maxSize = 5 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      const alert = await this.alertCtrl.create({
        header: 'Archivo demasiado grande',
        message: 'El tamaño máximo permitido es 2MB.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    // Convertir imagen a base64
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedImage = e.target.result;
      this.registerForm.patchValue({
        base_64: e.target.result, 
        public_name: file.name 
      });
    };
    reader.readAsDataURL(file);
  }
  
  
}

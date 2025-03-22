import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { User } from 'src/app/core/interfaces/auth.interface';
import { LocationService } from 'src/app/modules/auth/services/location.service';
import { identificationOptions } from 'src/app/core/constants/indentifications';
import { environment } from 'src/environments/environment';
import { CustomInputComponent } from 'src/app/pages/components/inputs/custom-input/custom-input.component';
import { HeaderComponent } from 'src/app/pages/components/header/header.component';
import { FooterComponent } from 'src/app/pages/components/footer-component/footer-component.component';

@Component({
  selector: 'app-user-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    CustomInputComponent,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './user-profile-edit.component.html',
  styleUrls: ['./user-profile-edit.component.scss']
})
export class UserProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  isSubmitting = false;
  selectedImage: string | ArrayBuffer | null = null;
  imageLoaded: string = '';

  departmentsOption: any[] = [];
  citiesOption: any[] = [];
  identificationOptions = identificationOptions;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private locationService: LocationService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      last_name: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      identification_type: ['', Validators.required],
      identification_number: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9-]+$')]],
      birth_date: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required],
      department: ['', Validators.required],
      city_id: ['', Validators.required],
      base_64: ['']
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadUserData();

    // Escuchar cambios en el departamento seleccionado y actualizar las ciudades
    this.profileForm.get('department')?.valueChanges.subscribe(departmentId => {
      if (departmentId) {
        this.profileForm.patchValue({ city_id: '' });
        this.loadCities(departmentId);
      }
    });
  }

  loadUserData(): void {
    this.userService.user$.subscribe(userData => {
      if (Array.isArray(userData) && userData.length > 0) {
        this.user = userData[0];
      } else {
        this.user = userData;
      }

      if (this.user) {
        this.profileForm.patchValue({
          first_name: this.user.first_name,
          last_name: this.user.last_name,
          identification_type: this.user.identification_type,
          identification_number: this.user.identification_number,
          email: this.user.email,
          phone: this.user.phone,
          birth_date: this.user.birth_date,
          gender: this.user.gender,
          address: this.user.address
        });

        if (this.user.image?.image_path) {
          this.imageLoaded = `${environment.url}${this.user.image.image_path.replace('\\', '/')}`;
        }

        if (this.user.location?.department_id) {
          this.profileForm.patchValue({ department: this.user.location.department_id });
          this.loadCities(this.user.location.department_id, this.user.location?.township_id);
        }
      }
    });
  }

  loadDepartments(): void {
    this.locationService.fetchDepartments();
    this.locationService.departments$.subscribe(departments => {
      this.departmentsOption = departments.map(dept => ({
        value: dept.id,
        label: dept.name
      }));
    });
  }

  loadCities(departmentId: any, cityId?: any): void {
    this.locationService.fetchCitiesByDepartment(departmentId);
    this.locationService.cities$.subscribe(cities => {
      this.citiesOption = cities.map(city => ({
        value: city.id,
        label: city.name
      }));

      if (cityId && cities.some(city => city.id === cityId)) {
        setTimeout(() => {
          this.profileForm.patchValue({ city_id: cityId });
        }, 100);
      }
    });
  }

  selectImage(): void {
    document.getElementById('imageInput')?.click();
  }

  async onImageSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      const alert = await this.toastCtrl.create({
        message: 'Solo se permiten imágenes en formato JPG, PNG o GIF.',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await alert.present();
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      const alert = await this.toastCtrl.create({
        message: 'El tamaño máximo permitido es 2MB.',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await alert.present();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedImage = e.target.result;
      this.profileForm.patchValue({
        base_64: e.target.result
      });
    };
    reader.readAsDataURL(file);
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        control?.markAsTouched();
      });

      const toast = await this.toastCtrl.create({
        message: 'Por favor complete todos los campos requeridos correctamente.',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
      return;
    }

    if (!this.user?.id) {
      const toast = await this.toastCtrl.create({
        message: 'Error: No se puede identificar al usuario.',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: 'Guardando cambios...'
    });
    await loading.present();

    const profileData = {
      ...this.profileForm.value,
      id: this.user.id
    };

    this.userService.updateProfile(profileData).subscribe({
      next: async (response) => {
        this.isSubmitting = false;
        await loading.dismiss();

        const toast = await this.toastCtrl.create({
          message: 'Perfil actualizado correctamente',
          duration: 3000,
          position: 'top',
          color: 'success'
        });
        await toast.present();

        this.router.navigate(['/profile']);
      },
      error: async (error) => {
        this.isSubmitting = false;
        await loading.dismiss();

        const toast = await this.toastCtrl.create({
          message: 'Error al actualizar el perfil: ' + (error.message || 'Intente nuevamente'),
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
        console.error('Error actualizando perfil:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home-desktop']);
  }

get first_name() { return this.profileForm.get('first_name') as FormControl; }
get last_name() { return this.profileForm.get('last_name') as FormControl; }
get identification_type() { return this.profileForm.get('identification_type') as FormControl; }
get identification_number() { return this.profileForm.get('identification_number') as FormControl; }
get email() { return this.profileForm.get('email') as FormControl; }
get phone() { return this.profileForm.get('phone') as FormControl; }
get birth_date() { return this.profileForm.get('birth_date') as FormControl; }
get gender() { return this.profileForm.get('gender') as FormControl; }
get address() { return this.profileForm.get('address') as FormControl; }
get department() { return this.profileForm.get('department') as FormControl; }
get city_id() { return this.profileForm.get('city_id') as FormControl; }
}

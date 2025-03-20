import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonicModule,
  AlertController,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { debounceTime } from 'rxjs';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { LocationService } from 'src/app/modules/auth/services/location.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TabBarComponent,
    CustomButtonComponent,
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  public userForm: FormGroup;
  public newImage: boolean = false;
  public selectedImage: string | ArrayBuffer | null = null;
  public imageLoaded: string = '';
  public buttonBackground: string = 'assets/background/secondary_button_bg.svg';

  public departments: any[] = [];
  public cities: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private locationService: LocationService
  ) {
    this.userForm = this.fb.group({
      id: [''],
      first_name: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],
      ],
      last_name: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],
      ],
      identification_type: ['', Validators.required],
      identification_number: [
        '',
        [Validators.required, Validators.pattern('^[0-9]+$')],
      ],
      address: ['', Validators.required],
      city_id: ['', Validators.required],
      department: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9-]+$')]],
      birth_date: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      public_name: ['', Validators.maxLength(50)],
      base_64: [''],
    });

    this.setupRealTimeValidation();
  }

  ngOnInit() {
    this.loadDepartments();

    this.userForm
      .get('department')
      ?.valueChanges.subscribe((departmentId) => {
        if (departmentId) {
          this.userForm.patchValue({ city_id: '' });
          this.loadCities(departmentId);
        }
      });

    this.loadUserData();
  }

  loadUserData() {
    this.userService.user$.subscribe(userData => {
      // If userData is an array, take the first element
      const user = Array.isArray(userData) ? userData[0] : userData;

      if (!user) {
        this.userForm.reset();
        this.userForm.patchValue({
          id: ''
        });
        return;
      }

      this.userForm.patchValue({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        identification_type: user.identification_type,
        identification_number: user.identification_number,
        address: user.address,
        phone: user.phone,
        birth_date: user.birth_date,
        gender: user.gender,
        email: user.email
      });

      if (user.image?.image_path) {
        this.imageLoaded = `${environment.url}${user.image.image_path.replace('\\', '/')}`;
      }

      this.locationService.fetchDepartments();
      this.locationService.departments$.subscribe((departments) => {
        this.departments = departments;

        if (user.location?.department_id) {
          this.userForm.patchValue({ department: user.location.department_id });

          this.loadCities(user.location.department_id, user.location?.township_id);
        }
      });
    });
  }


  loadDepartments() {
    this.locationService.fetchDepartments();
    this.locationService.departments$.subscribe((departments) => {
      this.departments = departments;
    });
  }

  loadCities(departmentId: any, cityId?: any) {
    this.locationService.fetchCitiesByDepartment(departmentId);

    this.locationService.cities$.subscribe((cities) => {
      this.cities = cities;

      if (cityId && cities.some(city => city.id === cityId)) {
        setTimeout(() => {
          this.userForm.patchValue({ city_id: cityId });
        }, 100);
      }
    });
  }


  setupRealTimeValidation() {
    this.userForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.userForm.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });
  }

  async saveUser() {
    if (this.userForm.valid) {
      const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
      await loading.present();

      const userData = { ...this.userForm.value };

      this.userService.updateProfile(userData).subscribe(
        async () => {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Éxito',
            message: 'Perfil actualizado correctamente.',
            buttons: ['OK'],
          });
          await alert.present();
          this.navCtrl.navigateBack('/user/home');
        },
        async (error: any) => {
          console.error("Error actualizando perfil:", error);
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Error',
            message: error.message || 'Error al actualizar el perfil',
            buttons: ['OK'],
          });
          await alert.present();
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

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      const alert = await this.alertCtrl.create({
        header: 'Formato no válido',
        message: 'Solo se permiten imágenes en formato JPG, PNG o GIF.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      const alert = await this.alertCtrl.create({
        header: 'Archivo demasiado grande',
        message: 'El tamaño máximo permitido es 2MB.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.newImage = true;
      this.selectedImage = e.target.result;
      this.userForm.patchValue({
        base_64: e.target.result,
        public_name: file.name,
      });
    };
    reader.readAsDataURL(file);
  }
}
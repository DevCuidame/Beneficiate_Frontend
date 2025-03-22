import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { debounceTime, finalize, Subscription } from 'rxjs';
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
export class UserFormComponent implements OnInit, OnDestroy {
  public userForm: FormGroup;
  public newImage: boolean = false;
  public selectedImage: string | ArrayBuffer | null = null;
  public imageLoaded: string = '';
  public buttonBackground: string = 'assets/background/secondary_button_bg.svg';

  public departments: any[] = [];
  public cities: any[] = [];
  
  private subscriptions: Subscription[] = [];

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
      public_name: ['', Validators.maxLength(50)],
      base_64: [''],
    });

    this.setupRealTimeValidation();
  }

  ngOnInit() {
    this.loadDepartments();
    
    const deptSub = this.userForm
      .get('department')
      ?.valueChanges.subscribe((departmentId) => {
        if (departmentId) {
          this.userForm.patchValue({ city_id: '' });
          this.loadCities(departmentId);
        }
      });
      
    if (deptSub) {
      this.subscriptions.push(deptSub);
    }

    this.loadUserData();
  }
  
  ngOnDestroy() {
    // Clean up all subscriptions to prevent memory leaks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadUserData() {
    const userSub = this.userService.user$.subscribe(userData => {
      // If userData is an array, take the first element
      const user = Array.isArray(userData) ? userData[0] : userData;

      if (!user) {
        this.userForm.reset();
        this.userForm.patchValue({
          id: ''
        });
        return;
      }

      console.log('Loading user data into form:', user);

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

      // Handle location data correctly
      this.locationService.fetchDepartments();
      const deptsSub = this.locationService.departments$.subscribe((departments) => {
        this.departments = departments;

        // Check if user has location data
        if (user.location) {
          const locationData = Array.isArray(user.location) ? user.location[0] : user.location;
          
          if (locationData?.department_id) {
            console.log(`Setting department to: ${locationData.department_id} (${locationData.department_name})`);
            this.userForm.patchValue({ department: locationData.department_id });
            
            // Load cities for the selected department
            this.loadCities(locationData.department_id, locationData?.township_id);
          }
        }
      });
      
      this.subscriptions.push(deptsSub);
    });
    
    this.subscriptions.push(userSub);
  }

  loadDepartments() {
    this.locationService.fetchDepartments();
    const deptsSub = this.locationService.departments$.subscribe((departments) => {
      this.departments = departments;
    });
    
    this.subscriptions.push(deptsSub);
  }

  loadCities(departmentId: any, cityId?: any) {
    console.log(`Loading cities for department ID: ${departmentId}, selected city: ${cityId}`);
    this.locationService.fetchCitiesByDepartment(departmentId);

    const citiesSub = this.locationService.cities$.subscribe((cities) => {
      this.cities = cities;

      if (cityId && cities.some(city => city.id === cityId)) {
        console.log(`Setting city_id to: ${cityId}`);
        setTimeout(() => {
          this.userForm.patchValue({ city_id: cityId });
        }, 100);
      }
    });
    
    this.subscriptions.push(citiesSub);
  }

  setupRealTimeValidation() {
    const formSub = this.userForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.userForm.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });
    
    this.subscriptions.push(formSub);
  }

  async saveUser() {
    if (this.userForm.valid) {
      const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
      await loading.present();

      const userData = { ...this.userForm.value };
      
      console.log('Saving user data:', userData);
      
      // First update the profile
      this.userService.updateProfile(userData).subscribe(
        async () => {
          // After successful update, refresh the user data from server
          const userId = userData.id;
          
          this.userService.refreshUserData(userId).pipe(
            finalize(async () => {
              await loading.dismiss();
              const alert = await this.alertCtrl.create({
                header: 'Éxito',
                message: 'Perfil actualizado correctamente.',
                buttons: ['OK'],
              });
              await alert.present();
              this.navCtrl.navigateBack('/user/home');
            })
          ).subscribe(
            (refreshedData) => {
              console.log('User data refreshed after update:', refreshedData);
            },
            async (error) => {
              console.error('Error refreshing user data:', error);
              // Even if refresh fails, we consider the update successful
              // since the profile was updated
            }
          );
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
    } else {
      console.warn('Form is not valid', this.userForm.errors);
      
      // Find which fields are invalid for debugging
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control && control.invalid) {
          console.warn(`Field ${key} is invalid:`, control.errors);
        }
      });
      
      const alert = await this.alertCtrl.create({
        header: 'Formulario Incompleto',
        message: 'Por favor complete todos los campos requeridos correctamente.',
        buttons: ['OK'],
      });
      await alert.present();
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
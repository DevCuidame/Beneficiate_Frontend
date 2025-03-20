import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { User } from 'src/app/core/interfaces/auth.interface';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { BasicDataComponent } from 'src/app/shared/components/basic-data/basic-data.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EditButtonComponent } from 'src/app/shared/components/edit-button/edit-button.component';
import { UserHeaderComponent } from '../../components/user-header/user-header.component';
import { UserService } from 'src/app/modules/auth/services/user.service';

@Component({
  selector: 'app-user-home',
  standalone: true, 
  imports: [
    IonicModule,
    CommonModule,
    UserHeaderComponent,
    TabBarComponent,
    BasicDataComponent,
    RouterModule,
    EditButtonComponent,
  ],
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHomeComponent implements OnInit {
  public activeUser: User | null = null;
  public selectedOption: string = '';
  public showBasicData: boolean = true;

  public categories: { label: string; route: string }[] = [
    { label: 'Condiciones', route: 'conditions' },
    { label: 'Antecedentes', route: 'medical-history' },
    { label: 'Medicamentos & Alergias', route: 'medicaments-allergies' },
    { label: 'Vacunas', route: 'vaccinations' }
  ];

  constructor(
    private userService: UserService,
    private navCtrl: NavController,
    private router: Router
  ) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.showBasicData = this.router.url === '/user/home';
    });

    this.userService.user$.subscribe((user) => {
      this.activeUser = user;
    });

    const currentRoute = this.router.url.split('/').pop();
    const foundCategory = this.categories.find(cat => cat.route === currentRoute);
    if (foundCategory) {
      this.selectedOption = foundCategory.route;
    }
  }

  isSelected(optionRoute: string): boolean {
    return this.selectedOption === optionRoute;
  }

  selectOption(optionRoute: string) {
    this.selectedOption = optionRoute;
    this.router.navigate(['/user/home', optionRoute]);
  }
}
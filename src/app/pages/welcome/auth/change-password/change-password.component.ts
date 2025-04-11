import { Component, OnInit } from '@angular/core';

import { HeaderComponent } from '../../../components/header/header.component';
import { ResetPasswordComponent } from 'src/app/modules/auth/pages/reset-password/reset-password.component';
import { FooterComponent } from 'src/app/pages/components/footer/footer.component';

@Component({
  selector: 'app-change-password',
  imports: [ HeaderComponent, FooterComponent, ResetPasswordComponent ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent  implements OnInit {

  constructor() {}

  ngOnInit() {}


}

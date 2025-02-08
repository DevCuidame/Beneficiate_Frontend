import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CustomButtonComponent } from './components/custom-button/custom-button.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CustomButtonComponent,
    TabBarComponent // ✅ Importamos el componente standalone
  ],
  exports: [CustomButtonComponent] // ✅ Lo exportamos para otros módulos
})
export class SharedModule {}

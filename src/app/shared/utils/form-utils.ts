import { FormGroup, Validators } from "@angular/forms";
import { isAdult } from "./checkAge.util";

/**
 * Configura los validadores del campo email según la edad del usuario
 * @param form FormGroup que contiene los campos 'birth_date' y 'email'
 * @param birthDateValue Fecha de nacimiento a evaluar
 * @param emailFieldName Nombre del campo de email en el formulario (por defecto 'email')
 * @param birthDateFieldName Nombre del campo de fecha de nacimiento (por defecto 'birth_date')
 * @returns boolean indicando si el usuario es mayor de edad
 */
export function setupEmailValidation(
    form: FormGroup,
    birthDateValue: string,
    emailFieldName: string = 'email',
    birthDateFieldName: string = 'birth_date'
  ): boolean {
    const userIsAdult = isAdult(birthDateValue);
    
    const emailControl = form.get(emailFieldName);
    
    if (!emailControl) {
      console.error(`Campo ${emailFieldName} no encontrado en el formulario`);
      return userIsAdult;
    }
    
    // Configura los validadores según la edad
    if (userIsAdult) {
      emailControl.setValidators([
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]);
    } else {
      emailControl.clearValidators();
      emailControl.setValue('');
    }
    
    // Actualiza el estado del control
    emailControl.updateValueAndValidity();
    
    return userIsAdult;
  }
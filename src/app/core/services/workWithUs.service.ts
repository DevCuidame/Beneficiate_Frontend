import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators';

const apiUrl = environment.url;  // Asegúrate de que 'url' esté bien configurada en environment.ts

@Injectable({
  providedIn: 'root'
})
export class WorkWithUsService {

  constructor(private http: HttpClient) { }

  // Método para enviar el formulario de trabajo
  sendWorkForm(formData: any): Observable<any> {
    console.log('formData', formData);
    return this.http.post(`${apiUrl}api/v1/work-with-us/send-work`, formData).pipe(
      map(response => {
        // Puedes hacer cualquier manejo adicional con la respuesta, si es necesario
        return response;
      }),
      catchError(error => {
        // Aquí se manejarían errores si los hay
        throw error;
      })
    );
  }
}

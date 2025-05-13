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

  sendWorkForm(formData: any): Observable<any> {
    return this.http.post(`${apiUrl}api/v1/work-with-us/send-work`, formData).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        throw error;
      })
    );
  }
}

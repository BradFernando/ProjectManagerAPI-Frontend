import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailConfirmationService {
  private apiUrl = 'http://localhost:5078/Users'; // URL de la API

  constructor(private http: HttpClient) {}

  // Enviar mensaje de confirmación a usuario por email
  sendConfirmationEmail(email: string, emailConfig: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/sendmessage`, emailConfig, { params: { email } });
  }

  // Confirmar correo electrónico de usuario
  confirmUserEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/confirmemail`, {}, { params: { email } });
  }

  // Rechazar confirmación de correo electrónico
  rejectUserEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rejectemail`, {}, { params: { email } });
  }

  // Verificar el estado de confirmación del correo electrónico
  checkConfirmationStatus(email: string): Observable<{ confirmed: boolean }> {
    const params = new HttpParams().set('email', email);
    return this.http.get<{ confirmed: boolean }>(`${this.apiUrl}/checkconfirmationstatus`, { params });
  }

  // Actualizar contraseña por email
  updatePasswordByEmail(email: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/updatepassword`, JSON.stringify(newPassword), {
      params: { email },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain' // Aceptar respuesta en formato de texto plano
      }
    });
  }


}

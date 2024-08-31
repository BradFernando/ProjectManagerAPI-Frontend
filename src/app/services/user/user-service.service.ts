import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService} from "../security/auth.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:5078/Users'; // URL de la API

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Registrar usuario
  registerUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Loguear usuario
  loginUser(loginRequest: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/login`, loginRequest, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json'
    });
  }

  // Obtener todos los usuarios
  getAllUsers(): Observable<any[]> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  // Obtener usuario por id
  getUserById(id: number): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
  }

  // Obtener un usuario por su userName
  getUserByUserName(userName: string): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.apiUrl}/byusername`, { headers, params: { userName } });
  }

  // Obtener usuario por email
  getUserByEmail(email: string): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.apiUrl}/byemail`, { headers, params: { email } });
  }

  // Actualizar usuario
  updateUser(id: number, user: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.put<any>(`${this.apiUrl}/${id}`, user, { headers });
  }

// Eliminar usuario
  deleteUser(id: number): Observable<string> {
    const headers = this.createAuthorizationHeader();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers, responseType: 'text' });
  }


  // Método para crear el encabezado de autorización con el token
  private createAuthorizationHeader(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}

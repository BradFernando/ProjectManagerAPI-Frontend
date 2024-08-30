import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;
  private user: any = null; // Añade la variable para almacenar el usuario

  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') ?? '{}'); // Recupera el usuario desde localStorage si existe
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  setUser(user: any): void {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user)); // Guarda el usuario en localStorage
  }

  getUser(): any {
    return this.user;
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user'); // Remueve el usuario de localStorage
  }
}

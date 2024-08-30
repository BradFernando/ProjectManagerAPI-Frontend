import { Component, Input, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from "../../../services/user/user-service.service";
import { AuthService } from "../../../services/security/auth.service";
import Swal from "sweetalert2";
import { DatePipe, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgOptimizedImage,
    NgIf,
    DatePipe,
    NgForOf
  ],
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {
  @Input() isVisible = false;
  @Output() closeModalEvent = new EventEmitter<void>();  // Emitir evento al cerrar
  userForm: FormGroup;
  userAvatar: string | null = null;
  isEditingProfile: boolean = false;
  isEditingUsername: boolean = false;
  isEditingPassword: boolean = false;
  activeTab: string = 'profile'; // Default active tab

  constructor(private fb: FormBuilder, private userService: UserService, private authService: AuthService) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      avatar: [''],
      newPassword: ['', [Validators.minLength(8)]],
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userForm.patchValue(user);
    this.userAvatar = user?.avatar || null;
  }

  closeModal(): void {
    this.isVisible = false;
    this.closeModalEvent.emit();  // Emitir evento al cerrar
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleEditSection(section: string): void {
    if (section === 'profile') {
      this.isEditingProfile = !this.isEditingProfile;
    } else if (section === 'username') {
      this.isEditingUsername = !this.isEditingUsername;
    } else if (section === 'password') {
      this.isEditingPassword = !this.isEditingPassword;
    }
  }

  saveProfile(): void {
    const updatedUser = {
      ...this.authService.getUser(),
      firstName: this.userForm.get('firstName')?.value,
      lastName: this.userForm.get('lastName')?.value,
      avatar: this.userAvatar
    };
    this.updateUser(updatedUser);
    this.isEditingProfile = false;
  }

  saveUsername(): void {
    const updatedUser = {
      ...this.authService.getUser(),
      userName: this.userForm.get('userName')?.value
    };
    this.updateUser(updatedUser);
    this.isEditingUsername = false;
  }

  savePassword(): void {
    if (this.userForm.get('newPassword')?.value !== this.userForm.get('confirmPassword')?.value) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    const updatedUser = {
      ...this.authService.getUser(),
      password: this.userForm.get('newPassword')?.value
    };

    this.updateUser(updatedUser);
    this.isEditingPassword = false;
    Swal.fire('Actualizado', 'Contraseña actualizada con éxito', 'success');
  }

  private updateUser(updatedUser: any): void {
    const userId = updatedUser.id;
    this.userService.updateUser(userId, updatedUser).subscribe(() => {
      this.authService.setUser(updatedUser);
      Swal.fire('Actualizado', 'Usuario actualizado con éxito', 'success');
      this.closeModal();
    }, (error: HttpErrorResponse) => {
      console.error('Error al actualizar el usuario:', error);
      if (error.status === 400) {
        const errorMessage = this.getErrorMessage(error);
        Swal.fire('Error', 'Solicitud incorrecta: ' + errorMessage, 'error');
      } else {
        Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
      }
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error && error.error.errors) {
      return Object.values(error.error.errors).join(', ');
    }
    return error.error?.message || 'Error desconocido';
  }

  // Listener para cerrar con "ESC"
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.closeModal();
  }
}

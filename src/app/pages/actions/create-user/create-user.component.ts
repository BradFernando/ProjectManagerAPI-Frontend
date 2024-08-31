import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from "../../../services/user/user-service.service";
import { AuthService } from "../../../services/security/auth.service";
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgIf } from "@angular/common";
import { CloudinaryService } from "../../../services/Cloudinary/cloudinary.service";

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  createUserForm: FormGroup;
  loggedInUser: any;
  selectedImage: string | ArrayBuffer | null | undefined = null;
  isEditMode: boolean = false;
  userId: number | null = null;
  originalPassword: string | null = null;
  passwordLabel: string = 'Contraseña'; // Etiqueta para la contraseña

  selectedFile: File | null = null;
  isVisible: boolean = false;
  isLoading: boolean = false; // Propiedad para manejar el estado de carga

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
    protected router: Router,
    private route: ActivatedRoute
  ) {
    this.createUserForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [{ value: '', disabled: true }, Validators.required], // Contraseña actual deshabilitada en edición
      newPassword: ['', Validators.required], // Nueva contraseña obligatoria en modo edición
      type: [{ value: 0, disabled: false }, Validators.required], // Inicialmente habilitado
      avatar: ['']
    });
  }

  ngOnInit(): void {
    this.loggedInUser = this.authService.getUser();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.userId = +id;
        this.passwordLabel = 'Contraseña Actual'; // Cambiar la etiqueta en modo edición
        this.loadUserData(this.userId);

        // Hacer que la nueva contraseña sea obligatoria en modo de edición
        this.createUserForm.get('newPassword')?.setValidators([Validators.required]);
        this.createUserForm.get('newPassword')?.updateValueAndValidity();
      } else {
        this.passwordLabel = 'Contraseña'; // Etiqueta para nuevo usuario
        this.createUserForm.get('password')?.enable(); // Habilitar el campo de contraseña para nuevo usuario
      }
    });

    if (this.loggedInUser.type !== 1) { // Deshabilitar 'type' si no es administrador
      this.createUserForm.get('type')?.disable();
    }
  }

  loadUserData(userId: number): void {
    this.userService.getUserById(userId).subscribe(user => {
      this.createUserForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        password: user.password, // Carga la contraseña hasheada en el campo Contraseña Actual
        type: user.type,
        avatar: user.avatar,
        status: user.status
      });
      this.originalPassword = user.password; // Guarda la contraseña original hasheada
      this.selectedImage = user.avatar;
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImage = e.target?.result || null;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.createUserForm.invalid) {
      // Forzar que todos los campos muestren sus errores si el formulario es inválido
      this.createUserForm.markAllAsTouched();
      Swal.fire('Error', 'Por favor completa todos los campos obligatorios.', 'error');
      return;
    }

    this.isLoading = true; // Inicia el loader
    const user = this.createUserForm.value;

    if (user.type === 1 && this.loggedInUser.type !== 1) {
      Swal.fire('Permiso denegado', 'No tienes permiso para crear/editar un administrador', 'error');
      this.isLoading = false; // Detiene el loader si ocurre un error
      return;
    }

    user.status = 1; // Establecer el status en 1 por defecto

    if (this.isEditMode) {
      user.id = this.userId;
      user.password = user.newPassword; // Usa la nueva contraseña
    }

    if (this.selectedFile) {
      this.cloudinaryService.uploadImage(this.selectedFile).subscribe(
        response => {
          user.avatar = response.imageUrl;
          this.proceedWithSaveOrUpdate(user);
        },
        error => {
          this.isLoading = false; // Detiene el loader si ocurre un error
          Swal.fire('Error', 'Hubo un problema al subir la imagen.', 'error');
        }
      );
    } else {
      this.proceedWithSaveOrUpdate(user);
    }
  }

  proceedWithSaveOrUpdate(user: any): void {
    if (this.isEditMode && this.userId) {
      this.userService.updateUser(this.userId, user).subscribe(
        response => {
          this.isLoading = false; // Detiene el loader
          Swal.fire('Usuario actualizado', 'El usuario ha sido actualizado exitosamente', 'success');
          this.router.navigate(['/sidenav/list-users']);
        },
        error => {
          this.isLoading = false; // Detiene el loader si ocurre un error
          console.error('Error al actualizar el usuario:', error);
          Swal.fire('Error', 'Hubo un problema al actualizar el usuario', 'error');
        }
      );
    } else {
      this.userService.registerUser(user).subscribe(
        response => {
          this.isLoading = false; // Detiene el loader
          Swal.fire('Usuario creado', 'El usuario ha sido creado exitosamente', 'success');
          this.router.navigate(['/sidenav/list-users']);
        },
        error => {
          this.isLoading = false; // Detiene el loader si ocurre un error
          console.error('Error al crear el usuario:', error);
          Swal.fire('Error', 'Hubo un problema al crear el usuario', 'error');
        }
      );
    }
  }

  deleteUser(): void {
    if (this.userId && (this.loggedInUser.type === 1 || this.loggedInUser.id === this.userId)) {
      this.userService.deleteUser(this.userId).subscribe(
        response => {
          Swal.fire('Usuario eliminado', 'El usuario ha sido eliminado exitosamente', 'success');
          this.router.navigate(['/sidenav/list-users']);
        },
        error => {
          Swal.fire('Error', 'Hubo un problema al eliminar el usuario', 'error');
        }
      );
    } else {
      Swal.fire('Permiso denegado', 'No tienes permiso para eliminar este usuario', 'error');
    }
  }
}

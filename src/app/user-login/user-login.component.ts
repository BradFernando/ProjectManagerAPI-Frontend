import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from "../services/user/user-service.service";
import { EmailConfirmationService } from "../services/email/email-confirmation.service";
import { CloudinaryService } from "../services/Cloudinary/cloudinary.service";
import Swal from 'sweetalert2'; // Para las alertas
import { Router } from '@angular/router';
import { LoaderComponent } from '../components/loader/loader.component';
import { NgIf } from "@angular/common";
import {HttpErrorResponse} from "@angular/common/http"; // Importa el componente de loader
import {AuthService} from "../services/security/auth.service";

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LoaderComponent,
    NgIf,
  ],
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {
  signUpForm: FormGroup;
  loginForm: FormGroup;  // Formulario de Login
  passwordRecoveryForm: FormGroup;
  selectedFile: File | null = null;
  isVisible: boolean = false; // Estado del loader

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private emailConfirmationService: EmailConfirmationService,
    private cloudinaryService: CloudinaryService,
    private router: Router,
    private authService: AuthService // Añade esta línea

  ) {
    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      avatar: ['']
    });

    this.passwordRecoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],  // Agrega el control userName
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    signUpButton?.addEventListener('click', () => {
      container?.classList.add("right-panel-active");
    });

    signInButton?.addEventListener('click', () => {
      container?.classList.remove("right-panel-active");
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      this.userService.loginUser(loginData).subscribe(
        response => {
          const token = JSON.parse(response).token;  // Captura el token desde la respuesta
          this.authService.setToken(token); // Guarda el token en el servicio

          // Obtener la información del usuario usando el token
          this.userService.getUserByUserName(loginData.userName).subscribe(userResponse => {
            this.authService.setUser(userResponse); // Guarda la información del usuario en el servicio

            Swal.fire('¡Inicio de sesión exitoso!', '', 'success');
            this.router.navigate(['/sidenav']);
          });
        },
        (error: HttpErrorResponse) => {
          const errorMessage = error.error?.error || 'Hubo un problema con el servidor. Por favor, intenta de nuevo.';
          const detailedErrorMessage = typeof error.error === 'string'
            ? error.error
            : error.error?.message || errorMessage;

          Swal.fire('Error', detailedErrorMessage, 'error');
        }
      );
    }
  }


  onRegister(event: Event): void {
    event.preventDefault();

    if (this.signUpForm.valid) {
      const user = {
        firstName: this.signUpForm.get('firstName')?.value,
        lastName: this.signUpForm.get('lastName')?.value,
        email: this.signUpForm.get('email')?.value,
        userName: this.signUpForm.get('userName')?.value,
        password: this.signUpForm.get('password')?.value,
        type: 0,
        status: 0,
        avatar: null as string | null
      };

      if (this.selectedFile) {
        this.isVisible = true; // Muestra el loader antes de subir la imagen
        this.cloudinaryService.uploadImage(this.selectedFile).subscribe(
          response => {
            user.avatar = response.imageUrl; // URL de la imagen cargada
            this.registerUser(user); // Registra el usuario con la imagen cargada
          },
          error => {
            this.isVisible = false; // Oculta el loader si ocurre un error
            Swal.fire('Error', 'Hubo un problema al subir la imagen.', 'error');
          }
        );
      } else {
        // Registro sin imagen
        this.registerUser(user);
      }
    }
  }

  registerUser(user: any): void {
    this.isVisible = true; // Muestra el loader
    this.userService.registerUser(user).subscribe(
      response => {
        this.isVisible = false; // Oculta el loader
        Swal.fire('¡Registro exitoso!', 'Se ha enviado un correo de confirmación.', 'success');
        this.sendConfirmationEmail(user.email);
      },
      error => {
        this.isVisible = false; // Oculta el loader si ocurre un error
        Swal.fire('Error', 'Hubo un problema al registrar el usuario.', 'error');
      }
    );
  }

  sendConfirmationEmail(email: string): void {
    const confirmationLink = `http://localhost:4200/confirm-email?email=${encodeURIComponent(email)}`;

    const emailConfig = {
      fromEmail: 'conference1ciences@gmail.com',
      fromPassword: 'cmlt irct lbgb vmet',
      subject: 'Confirma tu correo',
      body: `Necesitamos confirmar tu registro a Projects Manager API.
             <a href="${confirmationLink}">Haz clic aquí para confirmar tu correo electrónico</a>`
    };

    this.emailConfirmationService.sendConfirmationEmail(email, emailConfig).subscribe(
      response => {
        if (response === 'El correo electrónico no existe') {
          this.isVisible = false; // Oculta el loader si hay error
          Swal.fire('Error', 'El correo electrónico no existe.', 'error');
        } else {
          this.isVisible = false; // Oculta el loader si el correo fue enviado
          Swal.fire('¡Correo de confirmación enviado!', 'Por favor revisa tu correo electrónico.', 'info');
          this.router.navigate(['/']); // Redirige a la página principal después de enviar el correo
        }
      },
      error => {
        this.isVisible = false; // Oculta el loader si ocurre un error
        Swal.fire('Error', 'Hubo un problema al enviar el correo de confirmación.', 'error');
      }
    );
  }

  // Abre el modal de recuperación de contraseña
  openPasswordRecoveryModal(): void {
    const modal = document.getElementById('passwordRecoveryModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  // Cierra el modal de recuperación de contraseña
  closeModal(): void {
    const modal = document.getElementById('passwordRecoveryModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Enviar mensaje con enlace para restaurar contraseña
  sendPasswordResetEmail(email: string, resetLink: string): void {
    const emailConfig = {
      fromEmail: 'conference1ciences@gmail.com',
      fromPassword: 'cmlt irct lbgb vmet',
      subject: 'Restablecimiento de Contraseña',
      body: `Hemos recibido una solicitud para restablecer la contraseña.
           Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:
           <a href="${resetLink}">Restablecer Contraseña</a>`
    };

    this.emailConfirmationService.sendConfirmationEmail(email, emailConfig).subscribe(
      response => {
        if (response === 'El correo electrónico no existe') {
          this.isVisible = false; // Oculta el loader si hay error
          Swal.fire('Error', 'El correo electrónico no existe.', 'error');
        } else {
          this.isVisible = false; // Oculta el loader si el correo fue enviado
          Swal.fire('¡Correo enviado!', 'Se ha enviado un correo con el enlace para restablecer la contraseña.', 'info');
          this.closeModal();
        }
      },
      error => {
        this.isVisible = false; // Oculta el loader si ocurre un error
        Swal.fire('Error', 'Hubo un problema al enviar el correo de restablecimiento de contraseña.', 'error');
      }
    );
  }

  /// Maneja la solicitud de recuperación de contraseña
  onRequestPasswordReset(): void {
    if (this.passwordRecoveryForm.valid) {
      const email = this.passwordRecoveryForm.get('email')?.value;
      const resetLink = `http://localhost:4200/form-restore-password?email=${encodeURIComponent(email)}`;

      // Llama al método para enviar el correo electrónico con el enlace de recuperación de contraseña
      this.sendPasswordResetEmail(email, resetLink);
    }
  }
}

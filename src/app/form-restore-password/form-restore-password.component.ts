import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {EmailConfirmationService} from "../services/email/email-confirmation.service";
import {ActivatedRoute, Router} from "@angular/router";
import Swal from "sweetalert2";

@Component({
  selector: 'app-form-restore-password',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './form-restore-password.component.html',
  styleUrl: './form-restore-password.component.css'
})
export class FormRestorePasswordComponent implements OnInit {
  restorePasswordForm: FormGroup;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private emailConfirmationService: EmailConfirmationService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.restorePasswordForm = this.fb.group({
      newPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Obtiene el email de los parámetros de la URL
    this.activatedRoute.queryParams.subscribe(params => {
      this.email = params['email'];
    });
  }

  // Maneja la solicitud para actualizar la contraseña
  onSubmit(): void {
    if (this.restorePasswordForm.valid) {
      const newPassword = this.restorePasswordForm.get('newPassword')?.value;

      // Llama al servicio para actualizar la contraseña
      this.emailConfirmationService.updatePasswordByEmail(this.email, newPassword).subscribe(
        response => {
          Swal.fire('¡Contraseña actualizada!', 'La contraseña se ha actualizado con éxito.', 'success');
          this.router.navigate(['/login']); // Redirige al usuario a la página de inicio de sesión
        },
        error => {
          Swal.fire('Error', 'Hubo un problema al actualizar la contraseña.', 'error');
        }
      );
    }
  }
}

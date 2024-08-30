// src/app/components/confirmation-modal/confirmation-modal.component.ts
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {EmailConfirmationService} from "../../services/email/email-confirmation.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private emailConfirmationService: EmailConfirmationService,
    private router: Router
  ) {}

  closeModal(): void {
    this.router.navigate(['/']); // Regresa al usuario a la página de inicio
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      if (email) {
        this.confirmEmail(email);
      }
    });
  }

  confirmEmail(email: string): void {
    this.emailConfirmationService.confirmUserEmail(email).subscribe(
      response => {
        Swal.fire('¡Confirmación exitosa!', 'Tu correo ha sido confirmado.', 'success');
        this.router.navigate(['/login']);
      },
      error => {
        Swal.fire('Error', 'Hubo un problema al confirmar tu correo.', 'error');
      }
    );
  }
}

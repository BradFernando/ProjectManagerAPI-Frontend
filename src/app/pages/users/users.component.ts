import { Component, OnInit } from '@angular/core';
import { UserService } from "../../services/user/user-service.service";
import { AuthService } from "../../services/security/auth.service";
import { Router } from '@angular/router';
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterPipe } from './filter.pipe';
import Swal from 'sweetalert2'; // Importar SweetAlert

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    FormsModule,
    NgxPaginationModule,
    FilterPipe
  ],
  standalone: true
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loggedInUser: any;
  entriesToShow: number = 10;
  searchTerm: string = '';
  page: number = 1;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.authService.getUser();

    this.userService.getAllUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  canEditOrDelete(user: any): boolean {
    if (this.loggedInUser.type === 1) {
      return user.id !== this.loggedInUser.id;
    }

    return this.loggedInUser.type === 0 && user.type === 0;
  }

  editUser(userId: number): void {
    this.router.navigate(['/sidenav/edit-user', userId]);
  }

  deleteUser(userId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(userId).subscribe(
          (response) => {
            Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
            this.users = this.users.filter(user => user.id !== userId);
          },
          (error) => {
            Swal.fire('Error', 'Hubo un problema al eliminar el usuario.', 'error');
            console.error('Error deleting user:', error);
          }
        );
      }
    });
  }

  goToCreateUser(): void {
    this.router.navigate(['/sidenav/create-user']);
  }
}

import { Routes } from '@angular/router';
import { UserLoginComponent } from './user-login/user-login.component';
import { ConfirmationModalComponent } from "./components/confirmation-modal/confirmation-modal.component";
import { FormRestorePasswordComponent } from "./form-restore-password/form-restore-password.component";
import { SidenavComponent } from "./pages/components/sidenav/sidenav.component";
import { UsersComponent } from "./pages/users/users.component";
import { HeaderComponent } from "./pages/components/header/header.component";
import {CreateUserComponent} from "./pages/actions/create-user/create-user.component";

export const routes: Routes = [
  { path: 'login', component: UserLoginComponent },
  { path: 'confirm-email', component: ConfirmationModalComponent },
  { path: 'form-restore-password', component: FormRestorePasswordComponent },
  {
    path: 'sidenav',
    component: SidenavComponent,
    children: [
      { path: 'dashboard', component: HeaderComponent },
      { path: 'list-users', component: UsersComponent },
      {path: 'create-user', component: CreateUserComponent},
      { path: 'edit-user/:id', component: CreateUserComponent }, // Para editar un usuario

      // Otras rutas hijas para cargar diferentes vistas dentro del Sidenav
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirecciona a la página de login si no se especifica una ruta
];

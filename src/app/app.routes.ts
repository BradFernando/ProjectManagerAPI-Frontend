import { Routes } from '@angular/router';
import { UserLoginComponent } from './user-login/user-login.component';
import {ConfirmationModalComponent} from "./components/confirmation-modal/confirmation-modal.component";
import {FormRestorePasswordComponent} from "./form-restore-password/form-restore-password.component";
import {SidenavComponent} from "./pages/components/sidenav/sidenav.component";
import {HeaderComponent} from "./pages/components/header/header.component";


export const routes: Routes = [
  { path: 'login', component: UserLoginComponent },
  {path: 'confirm-email', component: ConfirmationModalComponent},
  { path: 'form-restore-password', component: FormRestorePasswordComponent },
  {path: 'sidenav', component: SidenavComponent},
  {path: 'header', component: HeaderComponent},
];

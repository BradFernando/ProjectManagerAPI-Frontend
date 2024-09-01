import { Routes } from '@angular/router';
import { UserLoginComponent } from './user-login/user-login.component';
import { ConfirmationModalComponent } from "./components/confirmation-modal/confirmation-modal.component";
import { FormRestorePasswordComponent } from "./form-restore-password/form-restore-password.component";
import { SidenavComponent } from "./pages/components/sidenav/sidenav.component";
import { UsersComponent } from "./pages/users/users.component";
import { CreateUserComponent } from "./pages/actions/create-user/create-user.component";
import { CompanysComponent } from "./pages/companys/companys.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { AreaWorkTypeComponent } from "./pages/area-work-type/area-work-type.component";
import { EmployeesComponent } from "./pages/employees/employees.component";
import { CreateEmployeeComponent } from "./pages/actions/create-employee/create-employee.component";
import {TaskComponent} from "./pages/task/task.component";
import {WorkReportComponent} from "./pages/work-report/work-report.component";
import {ListReportsComponent} from "./pages/list-reports/list-reports.component";

export const routes: Routes = [
  { path: 'login', component: UserLoginComponent },
  { path: 'confirm-email', component: ConfirmationModalComponent },
  { path: 'form-restore-password', component: FormRestorePasswordComponent },
  {
    path: 'sidenav',
    component: SidenavComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'area-work-type', component: AreaWorkTypeComponent },
      { path: 'list-companies', component: CompanysComponent },
      { path: 'list-users', component: UsersComponent },
      { path: 'list-employees', component: EmployeesComponent },
      {path: 'task-designation', component: TaskComponent},
      {path: 'list-end-reports', component: ListReportsComponent},
      { path: 'create-user', component: CreateUserComponent },
      { path: 'edit-user/:id', component: CreateUserComponent },
      { path: 'create-employee', component: CreateEmployeeComponent }, // Ruta para crear empleado
      { path: 'edit-employee/:id', component: CreateEmployeeComponent }, // Ruta para editar empleado
      {path: 'work-report', component: WorkReportComponent}
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' } // Redirecciona a la página de login si no se especifica una ruta
];

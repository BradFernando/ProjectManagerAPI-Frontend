import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/system/employee/employee.service';
import { AreaService } from '../../services/system/area/area.service';
import { JobTypeService } from '../../services/system/job/job-type.service';
import { EmployeeDto } from '../../services/models/employee.dto';
import { AreaDto } from '../../services/models/area.dto';
import { JobTypeDto } from '../../services/models/job-type.dto';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { FilterPipe } from "../users/filter.pipe";
import { Router } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    FormsModule,
    NgxPaginationModule,
    FilterPipe
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: EmployeeDto[] = [];
  areas: AreaDto[] = [];
  jobTypes: JobTypeDto[] = [];
  entriesToShow: number = 10;
  searchTerm: string = '';
  page: number = 1;

  constructor(
    private employeeService: EmployeeService,
    private areaService: AreaService,
    private jobTypeService: JobTypeService,
    private router: Router // Inyectar Router
  ) {}

  ngOnInit(): void {
    this.fetchEmployees();
    this.fetchAreas();
    this.fetchJobTypes();
  }

  fetchEmployees(): void {
    this.employeeService.getAllEmployees().subscribe(
      (data) => {
        this.employees = data;
      },
      (error) => {
        console.error('Error fetching employees:', error);
      }
    );
  }

  fetchAreas(): void {
    this.areaService.getAllAreas().subscribe(
      (data) => {
        this.areas = data;
      },
      (error) => {
        console.error('Error fetching areas:', error);
      }
    );
  }

  fetchJobTypes(): void {
    this.jobTypeService.getAllJobTypes().subscribe(
      (data) => {
        this.jobTypes = data;
      },
      (error) => {
        console.error('Error fetching job types:', error);
      }
    );
  }

  getAreaNameById(areaId: number): string {
    const area = this.areas.find(a => a.id === areaId);
    return area ? area.name : 'Desconocido';
  }

  getJobTypeNameById(jobTypeId: number): string {
    const jobType = this.jobTypes.find(j => j.id === jobTypeId);
    return jobType ? jobType.description : 'Desconocido';
  }

  editEmployee(employeeId: number): void {
    // Redirige a la ruta de edición de empleados
    this.router.navigate(['/sidenav/edit-employee', employeeId]);
  }

  deleteEmployee(employeeId: number): void {
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
        this.employeeService.deleteEmployee(employeeId).subscribe(
          () => {
            Swal.fire('Eliminado!', 'El empleado ha sido eliminado.', 'success');
            this.employees = this.employees.filter(employee => employee.id !== employeeId);
          },
          (error) => {
            Swal.fire('Error', 'Hubo un problema al eliminar el empleado.', 'error');
            console.error('Error deleting employee:', error);
          }
        );
      }
    });
  }

  goToCreateEmployee(): void {
    // Redirige a la ruta de creación de empleados
    this.router.navigate(['/sidenav/create-employee']);
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService} from "../../../services/system/employee/employee.service";
import { AreaService} from "../../../services/system/area/area.service";
import { JobTypeService} from "../../../services/system/job/job-type.service";
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgIf, NgForOf } from "@angular/common";

@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  createEmployeeForm: FormGroup;
  isEditMode: boolean = false;
  employeeId: number | null = null;
  areas: any[] = [];
  jobTypes: any[] = [];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private areaService: AreaService,
    private jobTypeService: JobTypeService,
    protected router: Router,
    private route: ActivatedRoute
  ) {
    this.createEmployeeForm = this.fb.group({
      ci: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      areaId: ['', Validators.required],
      jobTypeId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.employeeId = +id;
        this.loadEmployeeData(this.employeeId);
      }
    });

    this.fetchAreas();
    this.fetchJobTypes();
  }

  fetchAreas(): void {
    this.areaService.getAllAreas().subscribe(
      areas => {
        this.areas = areas;
      },
      error => {
        console.error('Error fetching areas:', error);
      }
    );
  }

  fetchJobTypes(): void {
    this.jobTypeService.getAllJobTypes().subscribe(
      jobTypes => {
        this.jobTypes = jobTypes;
      },
      error => {
        console.error('Error fetching job types:', error);
      }
    );
  }

  loadEmployeeData(employeeId: number): void {
    this.employeeService.getEmployeeById(employeeId).subscribe(employee => {
      this.createEmployeeForm.patchValue({
        ci: employee.ci,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        areaId: employee.areaId,
        jobTypeId: employee.jobTypeId
      });
    });
  }

  onSubmit(): void {
    if (this.createEmployeeForm.invalid) {
      this.createEmployeeForm.markAllAsTouched();
      Swal.fire('Error', 'Por favor completa todos los campos obligatorios.', 'error');
      return;
    }

    this.isLoading = true;
    const employee = this.createEmployeeForm.value;

    if (this.isEditMode) {
      this.employeeService.updateEmployee(this.employeeId!, employee).subscribe(
        response => {
          this.isLoading = false;
          Swal.fire('Empleado actualizado', 'El empleado ha sido actualizado exitosamente', 'success');
          this.router.navigate(['/sidenav/list-employees']);
        },
        error => {
          this.isLoading = false;
          Swal.fire('Error', 'Hubo un problema al actualizar el empleado', 'error');
        }
      );
    } else {
      this.employeeService.createEmployee(employee).subscribe(
        response => {
          this.isLoading = false;
          Swal.fire('Empleado creado', 'El empleado ha sido creado exitosamente', 'success');
          this.router.navigate(['/sidenav/list-employees']);
        },
        error => {
          this.isLoading = false;
          Swal.fire('Error', 'Hubo un problema al crear el empleado', 'error');
        }
      );
    }
  }
}

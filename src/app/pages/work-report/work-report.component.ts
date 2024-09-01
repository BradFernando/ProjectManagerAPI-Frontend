import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { WorkReportService } from "../../services/system/work/work-report.service";
import { WorkReportDto } from '../../services/models/work-report.dto';
import { TaskService } from '../../services/system/task/task.service';
import { EmployeeService } from '../../services/system/employee/employee.service';
import { TaskDto } from '../../services/models/task.dto';
import { EmployeeDto } from '../../services/models/employee.dto';
import Swal from 'sweetalert2';
import { NgIf, NgForOf, NgClass } from '@angular/common';
import { CloudinaryService } from "../../services/Cloudinary/cloudinary.service";

declare var $: any;

@Component({
  selector: 'app-work-report',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    NgClass
  ],
  templateUrl: './work-report.component.html',
  styleUrls: ['./work-report.component.css']
})
export class WorkReportComponent implements OnInit, AfterViewInit {
  workReportForm: FormGroup;
  tasks: TaskDto[] = [];
  employees: EmployeeDto[] = [];
  assignedEmployeeName: string = '';
  selectedTaskId: number | null = null;
  selectedEmployeeId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private workReportService: WorkReportService,
    private cloudinaryService: CloudinaryService,
    private taskService: TaskService,
    private employeeService: EmployeeService
  ) {
    this.workReportForm = this.fb.group({
      taskId: ['', Validators.required],
      description: ['', Validators.required],
      hoursWorked: ['', Validators.required],
      employeeId: ['']  // Campo oculto para employeeId
    });
  }

  ngOnInit(): void {
    this.fetchTasks();
    this.fetchEmployees();
  }

  ngAfterViewInit(): void {
    $('#description').summernote({
      placeholder: "Escribe tu reporte aquí",
      height: 200,
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
        ['color', ['color']],
        ['para', ['ol', 'ul', 'paragraph', 'height']],
        ['table', ['table']],
        ['insert', ['link', 'picture']],
        ['view', ['undo', 'redo']]
      ],
      callbacks: {
        onImageUpload: (files: FileList) => this.uploadImage(files)
      }
    });
  }

  fetchTasks(): void {
    this.taskService.getAllTasks().subscribe(
      (data) => {
        this.tasks = data;
      },
      (error) => {
        console.error('Error fetching tasks:', error);
      }
    );
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

  onTaskChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const taskId = +selectElement.value;
    this.selectedTaskId = taskId;
    const selectedTask = this.tasks.find(task => task.id === taskId);

    if (selectedTask) {
      const employee = this.employees.find(emp => emp.id === selectedTask.employeeId);
      this.assignedEmployeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Desconocido';

      // Guardamos el employeeId para enviarlo al backend
      this.selectedEmployeeId = selectedTask.employeeId;
      this.workReportForm.get('employeeId')?.setValue(this.selectedEmployeeId);  // Actualizar el FormControl para employeeId

      console.log('Selected Employee ID:', this.selectedEmployeeId);
    } else {
      this.assignedEmployeeName = '';
      this.selectedEmployeeId = null;
      this.workReportForm.get('employeeId')?.setValue(null);  // Resetear el FormControl para employeeId
    }
  }

  calculateAndSetHoursWorked(): void {
    const startDate = (document.getElementById('startDate') as HTMLInputElement).value;
    const endDate = (document.getElementById('endDate') as HTMLInputElement).value;
    if (startDate && endDate) {
      const hoursWorked = this.calculateHoursWorked(startDate, endDate);
      this.workReportForm.get('hoursWorked')?.setValue(hoursWorked);
    } else {
      this.workReportForm.get('hoursWorked')?.setValue('');
    }
  }

  onSubmit(): void {
    console.log("Submit button clicked");
    console.log("Form Valid:", this.workReportForm.valid);
    console.log("Form Value before changes:", this.workReportForm.value);

    // Obtener el valor del campo 'description' desde el editor Summernote
    const descriptionValue = $('#description').summernote('code');
    this.workReportForm.get('description')?.setValue(descriptionValue);

    // Validar si todos los campos están completos
    if (this.workReportForm.invalid || !this.selectedTaskId || this.selectedEmployeeId === null) {
      Swal.fire('Error', 'Por favor complete todos los campos requeridos y seleccione una tarea y un empleado válidos.', 'error');
      return;
    }

    // Preparar el objeto para enviar al servidor
    const workReport: WorkReportDto = {
      id: 0,
      description: this.workReportForm.get('description')?.value,
      taskId: this.selectedTaskId,
      employeeId: this.selectedEmployeeId,
      hoursWorked: this.workReportForm.get('hoursWorked')?.value
    };

    console.log("WorkReport to be sent:", workReport);

    this.workReportService.createWorkReport(workReport).subscribe(
      (response) => {
        console.log("Response from server:", response);
        Swal.fire('Éxito', 'Reporte de trabajo creado correctamente.', 'success');

        // Limpiar el formulario y los campos después del envío exitoso
        this.resetForm();
      },
      (error) => {
        console.error('Error creating work report:', error);
        Swal.fire('Error', 'Hubo un problema al crear el reporte de trabajo.', 'error');
      }
    );
  }

  resetForm(): void {
    this.workReportForm.reset();
    this.assignedEmployeeName = '';
    this.selectedTaskId = null;
    this.selectedEmployeeId = null;

    // Reiniciar campos de fecha de inicio y fin
    (document.getElementById('startDate') as HTMLInputElement).value = '';
    (document.getElementById('endDate') as HTMLInputElement).value = '';

    $('#description').summernote('reset'); // Reiniciar el editor de Summernote
  }

  calculateHoursWorked(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diff / (1000 * 60 * 60));
  }

  onCancel(): void {
    this.resetForm();
  }

  uploadImage(files: FileList): void {
    const file = files[0];
    this.cloudinaryService.uploadImage(file).subscribe(
      (response) => {
        const imageUrl = response.secure_url;
        $('#description').summernote('insertImage', imageUrl);
      },
      (error) => {
        Swal.fire('Error', 'No se pudo subir la imagen', 'error');
        console.error('Error subiendo imagen:', error);
      }
    );
  }
}

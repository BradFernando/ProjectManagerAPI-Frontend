import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../services/system/task/task.service';
import { EmployeeService } from '../../services/system/employee/employee.service';
import { TaskDto } from '../../services/models/task.dto';
import { EmployeeDto } from '../../services/models/employee.dto';
import Swal from 'sweetalert2';
import {NgIf, NgForOf, NgClass} from '@angular/common';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgForOf, NgClass],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  taskForm: FormGroup;
  tasks: TaskDto[] = [];
  employees: EmployeeDto[] = [];
  isEditMode: boolean = false;
  selectedTaskId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private employeeService: EmployeeService
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      employeeId: ['', Validators.required],
      status: ['Pendiente', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchTasks();
    this.fetchEmployees();
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

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      Swal.fire('Error', 'Por favor completa todos los campos obligatorios.', 'error');
      return;
    }

    const taskData: TaskDto = this.taskForm.value;

    if (this.isEditMode && this.selectedTaskId !== null) {
      this.taskService.updateTask(this.selectedTaskId, taskData).subscribe(
        () => {
          Swal.fire('Éxito', 'Tarea actualizada correctamente.', 'success');
          this.resetForm();
          this.fetchTasks();
        },
        (error) => {
          Swal.fire('Error', 'Error al actualizar la tarea.', 'error');
          console.error('Error updating task:', error);
        }
      );
    } else {
      this.taskService.createTask(taskData).subscribe(
        () => {
          Swal.fire('Éxito', 'Tarea creada correctamente.', 'success');
          this.resetForm();
          this.fetchTasks();
        },
        (error) => {
          Swal.fire('Error', 'Error al crear la tarea.', 'error');
          console.error('Error creating task:', error);
        }
      );
    }
  }

  editTask(task: TaskDto): void {
    this.isEditMode = true;
    this.selectedTaskId = task.id;
    this.taskForm.patchValue(task);
  }

  deleteTask(): void {
    if (this.selectedTaskId !== null) {
      this.taskService.deleteTask(this.selectedTaskId).subscribe(
        () => {
          Swal.fire('Eliminado', 'Tarea eliminada correctamente.', 'success');
          this.resetForm();
          this.fetchTasks();
        },
        (error) => {
          Swal.fire('Error', 'Error al eliminar la tarea.', 'error');
          console.error('Error deleting task:', error);
        }
      );
    }
  }

  resetForm(): void {
    this.taskForm.reset({ status: 'Pendiente' });
    this.isEditMode = false;
    this.selectedTaskId = null;
  }

  getEmployeeNameById(employeeId: number): string {
    const employee = this.employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Desconocido';
  }
}

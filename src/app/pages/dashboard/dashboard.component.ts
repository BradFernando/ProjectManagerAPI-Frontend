import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js/auto';
import { WorkReportService } from "../../services/system/work/work-report.service";
import { TaskService } from '../../services/system/task/task.service';
import { WorkReportDto } from '../../services/models/work-report.dto';
import { TaskDto } from '../../services/models/task.dto';
import { EmployeeDto } from "../../services/models/employee.dto";
import { EmployeeService } from "../../services/system/employee/employee.service";
import {NgClass, NgForOf} from "@angular/common";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [NgForOf, NgClass],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalTasks: number = 0;
  pendingTasks: number = 0;
  completedTasks: number = 0;
  rejectedTasks: number = 0;
  approvedReports: number = 0;
  rejectedReports: number = 0;
  activeEmployees: number = 0;
  averageHoursWorked: number = 0; // Promedio de horas trabajadas

  tasks: TaskDto[] = [];
  workReports: WorkReportDto[] = [];
  employees: EmployeeDto[] = [];
  starEmployees: EmployeeDto[] = [];

  constructor(
    private taskService: TaskService,
    private workReportService: WorkReportService,
    private employeeService: EmployeeService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.fetchTasks();
    this.fetchReports();
    this.fetchEmployees();
  }

  fetchTasks(): void {
    this.taskService.getAllTasks().subscribe(
      (data) => {
        this.tasks = data;
        this.calculateTaskKPIs();
        this.renderBarChart();
      },
      (error) => console.error('Error fetching tasks:', error)
    );
  }

  fetchReports(): void {
    this.workReportService.getAllWorkReports().subscribe(
      (data) => {
        this.workReports = data;
        this.calculateReportKPIs();
        this.calculateAverageHoursWorked();
        this.renderDonutCharts();
        this.renderPieChart();
        this.renderGaugeChart(); // Renderizar el gráfico de velocímetro
      },
      (error) => console.error('Error fetching reports:', error)
    );
  }

  fetchEmployees(): void {
    this.employeeService.getAllEmployees().subscribe(
      (data) => {
        this.employees = data;
        this.activeEmployees = this.employees.length;
        this.calculateStarEmployees();
      },
      (error) => console.error('Error fetching employees:', error)
    );
  }

  calculateTaskKPIs(): void {
    this.totalTasks = this.tasks.length;
    this.pendingTasks = this.tasks.filter(task => task.status === 'Pendiente').length;
    this.completedTasks = this.tasks.filter(task => task.status === 'Completado').length;
    this.rejectedTasks = this.tasks.filter(task => task.status === 'Rechazada').length;
  }

  calculateReportKPIs(): void {
    this.approvedReports = this.workReports.filter(report => {
      const task = this.tasks.find(t => t.id === report.taskId);
      return task?.status === 'Completado';
    }).length;

    this.rejectedReports = this.workReports.filter(report => {
      const task = this.tasks.find(t => t.id === report.taskId);
      return task?.status === 'Rechazada';
    }).length;
  }

  calculateAverageHoursWorked(): void {
    const totalHours = this.workReports.reduce((sum, report) => sum + report.hoursWorked, 0);
    this.averageHoursWorked = this.workReports.length ? totalHours / this.workReports.length : 0;
  }

  calculateStarEmployees(): void {
    const employeeTaskCount = this.tasks.reduce((acc, task) => {
      if (task.status === 'Completado') {
        acc[task.employeeId] = (acc[task.employeeId] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    this.starEmployees = this.employees.filter(employee => employeeTaskCount[employee.id] > 0)
      .sort((a, b) => (employeeTaskCount[b.id] || 0) - (employeeTaskCount[a.id] || 0))
      .slice(0, 3);
  }

  renderBarChart(): void {
    const barChartCanvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (barChartCanvas) {
      new Chart(barChartCanvas, {
        type: 'bar',
        data: {
          labels: ['Pendiente', 'Completado', 'Rechazada'],
          datasets: [{
            label: 'Número de Tareas',
            data: [this.pendingTasks, this.completedTasks, this.rejectedTasks],
            backgroundColor: ['#ffcc00', '#28a745', '#dc3545'],
            borderWidth: 1,
            borderColor: '#333'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                font: {
                  size: 14
                }
              }
            }
          }
        }
      });
    }
  }

  renderDonutCharts(): void {
    const totalTasksDonutCanvas = document.getElementById('totalTasksDonut') as HTMLCanvasElement;
    const activeEmployeesDonutCanvas = document.getElementById('activeEmployeesDonut') as HTMLCanvasElement;

    if (totalTasksDonutCanvas) {
      new Chart(totalTasksDonutCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Total Tareas', 'Restante'],
          datasets: [{
            data: [this.totalTasks, 100 - this.totalTasks],
            backgroundColor: ['#28a745', '#e9ecef']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }

    if (activeEmployeesDonutCanvas) {
      new Chart(activeEmployeesDonutCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Empleados Activos', 'Inactivos'],
          datasets: [{
            data: [this.activeEmployees, 100 - this.activeEmployees],
            backgroundColor: ['#007bff', '#e9ecef']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  renderGaugeChart(): void {
    const averageHoursGaugeCanvas = document.getElementById('averageHoursGauge') as HTMLCanvasElement;

    if (averageHoursGaugeCanvas) {
      new Chart(averageHoursGaugeCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Horas Trabajadas'],
          datasets: [{
            data: [this.averageHoursWorked, 100 - this.averageHoursWorked],
            backgroundColor: ['#007bff', '#e9ecef'],
            borderWidth: 0
          }]
        },
        options: {
          rotation: 270,
          circumference: 180,
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  renderPieChart(): void {
    const pieChartCanvas = document.getElementById('pieChart') as HTMLCanvasElement;

    if (pieChartCanvas) {
      new Chart(pieChartCanvas, {
        type: 'pie',
        data: {
          labels: ['Aprobado', 'Rechazado'],
          datasets: [{
            data: [this.approvedReports, this.rejectedReports],
            backgroundColor: ['#007bff', '#dc3545'],
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: {
                  size: 14
                }
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: '#333',
              titleFont: {
                size: 14
              },
              bodyFont: {
                size: 12
              }
            }
          }
        }
      });
    }
  }
}

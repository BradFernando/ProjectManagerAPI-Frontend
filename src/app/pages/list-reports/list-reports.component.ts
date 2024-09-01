import { Component, OnInit } from '@angular/core';
import { WorkReportService } from "../../services/system/work/work-report.service";
import { WorkReportDto } from '../../services/models/work-report.dto';
import { NgForOf, NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importa autoTable para crear tablas
import { AuthService } from "../../services/security/auth.service";
import { TaskService } from '../../services/system/task/task.service';
import { EmployeeService } from '../../services/system/employee/employee.service';
import { TaskDto } from '../../services/models/task.dto';
import { EmployeeDto } from '../../services/models/employee.dto';

@Component({
  selector: 'app-list-reports',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './list-reports.component.html',
  styleUrls: ['./list-reports.component.css']
})
export class ListReportsComponent implements OnInit {
  workReports: WorkReportDto[] = [];
  tasks: TaskDto[] = [];
  employees: EmployeeDto[] = [];
  currentUser: string | undefined = undefined; // Usuario autenticado

  constructor(
    private workReportService: WorkReportService,
    private authService: AuthService,
    private taskService: TaskService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.fetchWorkReports();
    this.fetchTasks();
    this.fetchEmployees();
    this.currentUser = this.authService.getUser()?.userName; // Obtener usuario autenticado
  }

  fetchWorkReports(): void {
    this.workReportService.getAllWorkReports().subscribe(
      (data) => {
        this.workReports = data;
      },
      (error) => {
        console.error('Error fetching work reports:', error);
        Swal.fire('Error', 'Hubo un problema al obtener los reportes de trabajo.', 'error');
      }
    );
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

  getTaskNameById(taskId: number): string {
    const task = this.tasks.find(t => t.id === taskId);
    return task ? task.title : 'Desconocido';
  }

  getEmployeeNameById(employeeId: number): string {
    const employee = this.employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Desconocido';
  }

  generatePdf(report: WorkReportDto): void {
    const employeeName = this.getEmployeeNameById(report.employeeId);
    const taskName = this.getTaskNameById(report.taskId);
    const description = report.description.replace(/<\/?[^>]+(>|$)/g, ""); // Remover etiquetas HTML

    const doc = new jsPDF();

    // Encabezado con color
    doc.setFillColor(34, 41, 55); // Color de fondo
    doc.rect(0, 0, 210, 30, 'F'); // Rectángulo para encabezado
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255); // Color del texto
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Trabajo", 105, 20, { align: "center" });

    // Subtítulo
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Cambiar a color negro
    doc.setFont("helvetica", "normal");
    doc.text(`Estimado ${employeeName}, su reporte de trabajo está considerado con lo siguiente:`, 10, 50);

    // Información en tabla
    autoTable(doc, {
      startY: 60,
      margin: { top: 60 }, // Añadir margen superior
      head: [['Detalle', 'Información']],
      body: [
        ['Horas Trabajadas', report.hoursWorked.toString()],
        ['Tarea Asignada', taskName],
        ['Comentarios', description],
        ['Revisor', this.currentUser || 'undefined'],
      ],
      theme: 'striped', // Tema con líneas
      headStyles: { fillColor: [34, 41, 55], textColor: 255 }, // Color del encabezado
      bodyStyles: { textColor: 50, lineColor: [0, 0, 0], lineWidth: 0.1 }, // Ajuste de estilo para el cuerpo
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Alternar color de fila
      styles: { minCellHeight: 10 }, // Altura mínima de la celda
      didDrawCell: (data) => {
        // Ajuste de celda si el texto es demasiado largo
        if (data.column.dataKey === 'Comentarios' && data.cell.text[0].length > 50) {
          doc.setFontSize(10);
          data.cell.styles.minCellHeight = 15; // Incrementar altura de celda
        }
      }
    });

    // Firma simulada (un simple símbolo o texto estilizado)
    doc.setFontSize(20);
    doc.setFont("cursive");
    doc.setTextColor(50, 50, 50);
    doc.text("+", 160, doc.internal.pageSize.height - 50); // Añadir un símbolo que represente una firma
    doc.text("PMA Solutions", 140, doc.internal.pageSize.height - 40); // Texto estilizado como firma

    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Es un placer atenderle.", 10, doc.internal.pageSize.height - 30);
    doc.text("Por favor, contacte con nosotros si tiene alguna pregunta o necesita más información.", 10, doc.internal.pageSize.height - 20);

    // Firma de texto
    doc.setFontSize(12);
    doc.text("Atentamente,", 10, doc.internal.pageSize.height - 10);
    doc.text("Equipo de Project Manager API", 10, doc.internal.pageSize.height - 3);

    // Guardar PDF
    doc.save(`Reporte_${report.id}.pdf`);
  }

  approveReport(reportId: number): void {
    Swal.fire('Aprobado', 'Reporte aprobado exitosamente.', 'success');
  }

  rejectReport(reportId: number): void {
    Swal.fire('Rechazado', 'Reporte rechazado exitosamente.', 'success');
  }
}

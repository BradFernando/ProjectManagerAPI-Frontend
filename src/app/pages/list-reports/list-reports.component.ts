import { Component, OnInit } from '@angular/core';
import { WorkReportService } from "../../services/system/work/work-report.service";
import { WorkReportDto } from '../../services/models/work-report.dto';
import { NgForOf, NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  currentUser: string | undefined = undefined;

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
    this.currentUser = this.authService.getUser()?.userName;
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

  generateAndSendPdf(report: WorkReportDto, taskStatus: string): void {
    const employeeName = this.getEmployeeNameById(report.employeeId);
    const taskName = this.getTaskNameById(report.taskId);
    const description = report.description.replace(/<\/?[^>]+(>|$)/g, "");

    const doc = new jsPDF();

    doc.setFillColor(34, 41, 55);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Trabajo", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Estimado ${employeeName}, su reporte de trabajo está considerado con lo siguiente:`, 10, 50);

    autoTable(doc, {
      startY: 60,
      margin: { top: 60 },
      head: [['Detalle', 'Información']],
      body: [
        ['Horas Trabajadas', report.hoursWorked.toString()],
        ['Tarea Asignada', taskName],
        ['Comentarios', description],
        ['Revisor', this.currentUser || 'undefined'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [34, 41, 55], textColor: 255 },
      bodyStyles: { textColor: 50, lineColor: [0, 0, 0], lineWidth: 0.1 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: { minCellHeight: 10 },
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Estado del Trabajo:", 10, finalY);

    if (taskStatus === 'Completado') {
      doc.setTextColor(0, 128, 0);
    } else if (taskStatus === 'Pendiente') {
      doc.setTextColor(255, 165, 0);
    } else if (taskStatus === 'Rechazada') {
      doc.setTextColor(255, 0, 0);
    }

    doc.text(`Por lo tanto, hecha las evaluaciones pertinentes su trabajo está considerado como: ${taskStatus}`, 10, finalY + 10);

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("+", 160, doc.internal.pageSize.height - 50);
    doc.text("PMA Solutions", 140, doc.internal.pageSize.height - 40);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Es un placer atenderle.", 10, doc.internal.pageSize.height - 30);
    doc.text("Por favor, contacte con nosotros si tiene alguna pregunta o necesita más información.", 10, doc.internal.pageSize.height - 20);

    doc.setFontSize(12);
    doc.text("Atentamente,", 10, doc.internal.pageSize.height - 10);
    doc.text("Equipo de Project Manager API", 10, doc.internal.pageSize.height - 3);

    // Generar el PDF como blob para enviar
    const pdfBlob = doc.output('blob');
    const formData: FormData = new FormData();
    formData.append('pdf', pdfBlob, `Reporte_${report.id}_${new Date().getTime()}.pdf`);
    formData.append('employeeId', report.employeeId.toString());
    formData.append('reportId', report.id.toString());

    // Enviar el PDF al servidor con el estado correcto
    this.workReportService.sendReport(formData).subscribe(
      (response) => {
        console.log('Respuesta del servidor:', response);
        Swal.fire('Éxito', 'Reporte enviado correctamente.', 'success');
      },
      (error) => {
        console.error('Error al enviar el reporte:', error);
        Swal.fire('Error', `Hubo un problema al enviar el reporte: ${error.message || 'Error desconocido'}`, 'error');
      }
    );
  }

  approveReport(reportId: number): void {
    const report = this.workReports.find(r => r.id === reportId);
    if (report) {
      const taskId = report.taskId;
      this.updateTaskStatus(taskId, 'Completado', report);
    }
  }

  rejectReport(reportId: number): void {
    const report = this.workReports.find(r => r.id === reportId);
    if (report) {
      const taskId = report.taskId;
      this.updateTaskStatus(taskId, 'Rechazada', report);
    }
  }

  updateTaskStatus(taskId: number, status: string, report: WorkReportDto): void {
    this.taskService.getTaskById(taskId).subscribe(
      (task) => {
        task.status = status;
        this.taskService.updateTask(taskId, task).subscribe(
          () => {
            console.log(`Tarea ${taskId} actualizada a estado: ${status}`);
            this.fetchTasks();
            this.generateAndSendPdf(report, status); // Generar y enviar PDF con el estado actualizado
          },
          (error) => {
            console.error('Error al actualizar el estado de la tarea:', error);
            Swal.fire('Error', 'Hubo un problema al actualizar el estado de la tarea.', 'error');
          }
        );
      },
      (error) => {
        console.error('Error fetching task:', error);
        Swal.fire('Error', 'Hubo un problema al obtener la tarea.', 'error');
      }
    );
  }

  downloadLocalPdf(report: WorkReportDto): void {
    const employeeName = this.getEmployeeNameById(report.employeeId);
    const taskName = this.getTaskNameById(report.taskId);
    const description = report.description.replace(/<\/?[^>]+(>|$)/g, "");

    // Obtener el estado de la tarea asociada al reporte
    const task = this.tasks.find(t => t.id === report.taskId);
    const taskStatus = task ? task.status : 'Desconocido';

    const doc = new jsPDF();

    doc.setFillColor(34, 41, 55);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Trabajo", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Estimado ${employeeName}, su reporte de trabajo está considerado con lo siguiente:`, 10, 50);

    autoTable(doc, {
      startY: 60,
      margin: { top: 60 },
      head: [['Detalle', 'Información']],
      body: [
        ['Horas Trabajadas', report.hoursWorked.toString()],
        ['Tarea Asignada', taskName],
        ['Comentarios', description],
        ['Revisor', this.currentUser || 'undefined'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [34, 41, 55], textColor: 255 },
      bodyStyles: { textColor: 50, lineColor: [0, 0, 0], lineWidth: 0.1 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: { minCellHeight: 10 },
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Estado del Trabajo:", 10, finalY);

    if (taskStatus === 'Completado') {
      doc.setTextColor(0, 128, 0);
    } else if (taskStatus === 'Pendiente') {
      doc.setTextColor(255, 165, 0);
    } else if (taskStatus === 'Rechazada') {
      doc.setTextColor(255, 0, 0);
    }

    doc.text(`Por lo tanto, hecha las evaluaciones pertinentes su trabajo está considerado como: ${taskStatus}`, 10, finalY + 10);

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("+", 160, doc.internal.pageSize.height - 50);
    doc.text("PMA Solutions", 140, doc.internal.pageSize.height - 40);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Es un placer atenderle.", 10, doc.internal.pageSize.height - 30);
    doc.text("Por favor, contacte con nosotros si tiene alguna pregunta o necesita más información.", 10, doc.internal.pageSize.height - 20);

    doc.setFontSize(12);
    doc.text("Atentamente,", 10, doc.internal.pageSize.height - 10);
    doc.text("Equipo de Project Manager API", 10, doc.internal.pageSize.height - 3);

    // Descargar el PDF en lugar de enviarlo
    doc.save(`Reporte_${report.id}_${new Date().getTime()}.pdf`);
  }
}

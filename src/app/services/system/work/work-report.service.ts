import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { WorkReportDto } from "../../models/work-report.dto";

@Injectable({
  providedIn: 'root'
})
export class WorkReportService {

  private apiUrl = 'http://localhost:8080/api/reportes-trabajo'; // URL base

  constructor(private http: HttpClient) { }

  getAllWorkReports(): Observable<WorkReportDto[]> {
    return this.http.get<WorkReportDto[]>(this.apiUrl);
  }

  getWorkReportById(id: number): Observable<WorkReportDto> {
    return this.http.get<WorkReportDto>(`${this.apiUrl}/${id}`);
  }

  createWorkReport(workReport: WorkReportDto): Observable<WorkReportDto> {
    return this.http.post<WorkReportDto>(this.apiUrl, workReport);
  }

  updateWorkReport(id: number, workReport: WorkReportDto): Observable<WorkReportDto> {
    return this.http.put<WorkReportDto>(`${this.apiUrl}/${id}`, workReport);
  }

  deleteWorkReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Modificar el método para enviar el reporte utilizando la URL base con la ruta adicional '/send-report'
  sendReport(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-report`, formData); // Usar la URL base con '/send-report'
  }
}

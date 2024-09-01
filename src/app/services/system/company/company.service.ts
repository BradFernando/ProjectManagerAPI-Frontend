import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CompanyDto} from "../../models/company.dto";

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private apiUrl = 'http://localhost:8080/api/empresas';

  constructor(private http: HttpClient) { }

  getAllCompanies(): Observable<CompanyDto[]> {
    return this.http.get<CompanyDto[]>(this.apiUrl);
  }

  getCompanyById(id: number): Observable<CompanyDto> {
    return this.http.get<CompanyDto>(`${this.apiUrl}/${id}`);
  }

  createCompany(company: CompanyDto): Observable<CompanyDto> {
    return this.http.post<CompanyDto>(this.apiUrl, company);
  }

  updateCompany(id: number, company: CompanyDto): Observable<CompanyDto> {
    return this.http.put<CompanyDto>(`${this.apiUrl}/${id}`, company);
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {JobTypeDto} from "../../models/job-type.dto";

@Injectable({
  providedIn: 'root'
})
export class JobTypeService {

  private apiUrl = 'http://localhost:8080/api/tipos-trabajo';

  constructor(private http: HttpClient) { }

  getAllJobTypes(): Observable<JobTypeDto[]> {
    return this.http.get<JobTypeDto[]>(this.apiUrl);
  }

  getJobTypeById(id: number): Observable<JobTypeDto> {
    return this.http.get<JobTypeDto>(`${this.apiUrl}/${id}`);
  }

  createJobType(jobType: JobTypeDto): Observable<JobTypeDto> {
    return this.http.post<JobTypeDto>(this.apiUrl, jobType);
  }

  updateJobType(id: number, jobType: JobTypeDto): Observable<JobTypeDto> {
    return this.http.put<JobTypeDto>(`${this.apiUrl}/${id}`, jobType);
  }

  deleteJobType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AreaDto} from "../../models/area.dto";

@Injectable({
  providedIn: 'root'
})
export class AreaService {

  private apiUrl = 'http://localhost:8080/api/areas';

  constructor(private http: HttpClient) { }

  getAllAreas(): Observable<AreaDto[]> {
    return this.http.get<AreaDto[]>(this.apiUrl);
  }

  getAreaById(id: number): Observable<AreaDto> {
    return this.http.get<AreaDto>(`${this.apiUrl}/${id}`);
  }

  createArea(area: AreaDto): Observable<AreaDto> {
    return this.http.post<AreaDto>(this.apiUrl, area);
  }

  updateArea(id: number, area: AreaDto): Observable<AreaDto> {
    return this.http.put<AreaDto>(`${this.apiUrl}/${id}`, area);
  }

  deleteArea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

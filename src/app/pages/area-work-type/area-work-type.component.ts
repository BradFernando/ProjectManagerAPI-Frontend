import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AreaService } from '../../services/system/area/area.service';
import { JobTypeService } from '../../services/system/job/job-type.service';
import { CompanyService } from '../../services/system/company/company.service';
import { AreaDto } from '../../services/models/area.dto';
import { JobTypeDto } from '../../services/models/job-type.dto';
import { CompanyDto } from '../../services/models/company.dto';
import Swal from 'sweetalert2';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-area-work-type',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './area-work-type.component.html',
  styleUrls: ['./area-work-type.component.css']
})
export class AreaWorkTypeComponent implements OnInit {
  areas: AreaDto[] = [];
  jobTypes: JobTypeDto[] = [];
  companies: CompanyDto[] = [];
  showModal: boolean = false;
  showJobTypeModal: boolean = false;
  areaForm: FormGroup;
  jobTypeForm: FormGroup;
  selectedArea: AreaDto | null = null;
  selectedJobType: JobTypeDto | null = null;

  constructor(
    private areaService: AreaService,
    private jobTypeService: JobTypeService,
    private companyService: CompanyService,
    private fb: FormBuilder
  ) {
    this.areaForm = this.fb.group({
      name: ['', Validators.required],
      companyId: ['', Validators.required]
    });

    this.jobTypeForm = this.fb.group({
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchAreas();
    this.fetchJobTypes();
    this.fetchCompanies();
  }

  fetchAreas(): void {
    this.areaService.getAllAreas().subscribe((data: AreaDto[]) => {
      this.areas = data;
    });
  }

  fetchJobTypes(): void {
    this.jobTypeService.getAllJobTypes().subscribe((data: JobTypeDto[]) => {
      this.jobTypes = data;
    });
  }

  fetchCompanies(): void {
    this.companyService.getAllCompanies().subscribe((data: CompanyDto[]) => {
      this.companies = data;
    });
  }

  getCompanyNameById(companyId: number): string {
    const company = this.companies.find(c => c.id === companyId);
    return company ? company.name : 'Desconocida';
  }

  openAreaModal(area?: AreaDto): void {
    this.showModal = true;
    if (area) {
      this.selectedArea = area;
      this.areaForm.patchValue(area);
    } else {
      this.selectedArea = null;
      this.areaForm.reset();
    }
  }

  closeAreaModal(): void {
    this.showModal = false;
    this.selectedArea = null;
  }

  saveArea(): void {
    if (this.areaForm.valid) {
      const areaData: AreaDto = this.areaForm.value;
      if (this.selectedArea) {
        this.areaService.updateArea(this.selectedArea.id, areaData).subscribe(() => {
          this.fetchAreas();
          this.closeAreaModal();
        }, error => {
          console.error('Error al actualizar el área:', error);
        });
      } else {
        this.areaService.createArea(areaData).subscribe(() => {
          this.fetchAreas();
          this.closeAreaModal();
        }, error => {
          console.error('Error al crear el área:', error);
        });
      }
    }
  }

  deleteArea(): void {
    if (this.selectedArea) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.selectedArea) {  // Verificación explícita para evitar errores
            this.areaService.deleteArea(this.selectedArea.id).subscribe(() => {
              Swal.fire(
                '¡Eliminado!',
                'El área ha sido eliminada.',
                'success'
              );
              this.fetchAreas();
              this.closeAreaModal();
            }, error => {
              console.error('Error al eliminar el área:', error);
              Swal.fire(
                'Error',
                'Hubo un problema al eliminar el área.',
                'error'
              );
            });
          }
        }
      });
    }
  }

  openJobTypeModal(jobType?: JobTypeDto): void {
    this.showJobTypeModal = true;
    if (jobType) {
      this.selectedJobType = jobType;
      this.jobTypeForm.patchValue(jobType);
    } else {
      this.selectedJobType = null;
      this.jobTypeForm.reset();
    }
  }

  closeJobTypeModal(): void {
    this.showJobTypeModal = false;
    this.selectedJobType = null;
  }

  saveJobType(): void {
    if (this.jobTypeForm.valid) {
      const jobTypeData: JobTypeDto = this.jobTypeForm.value;
      if (this.selectedJobType) {
        this.jobTypeService.updateJobType(this.selectedJobType.id, jobTypeData).subscribe(() => {
          this.fetchJobTypes();
          this.closeJobTypeModal();
        }, error => {
          console.error('Error al actualizar el tipo de trabajo:', error);
        });
      } else {
        this.jobTypeService.createJobType(jobTypeData).subscribe(() => {
          this.fetchJobTypes();
          this.closeJobTypeModal();
        }, error => {
          console.error('Error al crear el tipo de trabajo:', error);
        });
      }
    }
  }

  deleteJobType(): void {
    if (this.selectedJobType) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.selectedJobType) {  // Verificación explícita para evitar errores
            this.jobTypeService.deleteJobType(this.selectedJobType.id).subscribe(() => {
              Swal.fire(
                '¡Eliminado!',
                'El tipo de trabajo ha sido eliminado.',
                'success'
              );
              this.fetchJobTypes();
              this.closeJobTypeModal();
            }, error => {
              console.error('Error al eliminar el tipo de trabajo:', error);
              Swal.fire(
                'Error',
                'Hubo un problema al eliminar el tipo de trabajo.',
                'error'
              );
            });
          }
        }
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from "../../services/system/company/company.service";
import { CompanyDto } from "../../services/models/company.dto";
import { CloudinaryService } from "../../services/Cloudinary/cloudinary.service";
import { NgForOf, NgIf, NgStyle } from "@angular/common";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-companys',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    NgStyle,
    NgIf
  ],
  templateUrl: './companys.component.html',
  styleUrls: ['./companys.component.css']
})
export class CompanysComponent implements OnInit {
  companies: CompanyDto[] = [];
  showModal: boolean = false;
  companyForm: FormGroup;
  selectedCompany: CompanyDto | null = null;
  imageUploading: boolean = false; // Estado para manejar la carga de imagen

  constructor(
    private companyService: CompanyService,
    private cloudinaryService: CloudinaryService,
    private fb: FormBuilder
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      avatar: ['']
    });
  }

  ngOnInit(): void {
    this.fetchCompanies();
  }

  fetchCompanies(): void {
    this.companyService.getAllCompanies().subscribe((data: CompanyDto[]) => {
      this.companies = data;
    });
  }

  openModal(company?: CompanyDto): void {
    this.showModal = true;
    if (company) {
      this.selectedCompany = company;
      this.companyForm.patchValue(company);
    } else {
      this.selectedCompany = null;
      this.companyForm.reset();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCompany = null;
  }

  saveCompany(): void {
    if (this.companyForm.valid) {
      const companyData: CompanyDto = this.companyForm.value;
      console.log('Datos de la empresa a guardar:', companyData); // Verificar los datos antes de enviar

      if (this.selectedCompany) {
        // Editar empresa existente
        this.companyService.updateCompany(this.selectedCompany.id, companyData).subscribe(() => {
          this.fetchCompanies();
          this.closeModal();
        }, error => {
          console.error('Error al actualizar la empresa:', error);
        });
      } else {
        // Crear nueva empresa
        this.companyService.createCompany(companyData).subscribe(() => {
          this.fetchCompanies();
          this.closeModal();
        }, error => {
          console.error('Error al crear la empresa:', error);
        });
      }
    }
  }

  deleteCompany(): void {
    if (this.selectedCompany) {
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
          this.companyService.deleteCompany(this.selectedCompany!.id).subscribe(() => {
            Swal.fire(
              '¡Eliminado!',
              'La empresa ha sido eliminada.',
              'success'
            );
            this.fetchCompanies();
            this.closeModal();
          }, error => {
            console.error('Error al eliminar la empresa:', error);
            Swal.fire(
              'Error',
              'Hubo un problema al eliminar la empresa.',
              'error'
            );
          });
        }
      });
    }
  }

  uploadImage(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageUploading = true; // Comenzar la carga
      this.cloudinaryService.uploadImage(file).subscribe(response => {
        console.log('Imagen subida a Cloudinary:', response); // Verificar respuesta aquí
        const uploadedImageUrl = response.imageUrl; // Cambiar de response.url a response.imageUrl
        this.companyForm.patchValue({ avatar: uploadedImageUrl }); // Actualizar la URL en el formulario
        console.log('URL de la imagen asignada al formulario:', this.companyForm.value.avatar); // Verificar que la URL esté asignada
        this.imageUploading = false; // Finalizar la carga
      }, error => {
        console.error('Error al cargar la imagen:', error);
        this.imageUploading = false; // Manejar error de carga
      });
    }
  }
}

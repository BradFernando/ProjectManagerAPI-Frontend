import { Component } from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  // Puedes controlar la visibilidad del loader con esta propiedad
  isVisible: boolean = true;

  // Método para ocultar el loader
  hideLoader(): void {
    this.isVisible = false;
  }
}

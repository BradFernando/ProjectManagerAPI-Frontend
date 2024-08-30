import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { NgClass, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from "@angular/cdk/menu";
import { languages, notifications, userItems } from "./header-dummy-data";
import { AuthService } from "../../../services/security/auth.service";
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserCardComponent } from "../user-card/user-card.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgOptimizedImage,
    NgForOf,
    MatMenuModule,
    CdkMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    UserCardComponent,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() collapsed = false;
  @Input() screenWidth = 0;

  canShowSearchAsOverlay = false;
  selectedLanguage: any;
  isUserCardVisible = false;
  languages = languages;
  notifications = notifications;
  userItems = userItems;
  userAvatar: string | null = null;

  @ViewChild('searchOverlay', { static: false }) searchOverlay: any;
  @ViewChild('languageOverlay', { static: false }) languageOverlay: any;
  @ViewChild('notificationOverlay', { static: false }) notificationOverlay: any;
  @ViewChild('userOverlay', { static: false }) userOverlay: any;

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkCanShowSearchAsOverlay(window.innerWidth);
  }

  ngOnInit(): void {
    this.selectedLanguage = this.languages[0];

    // Obtener el avatar del usuario logueado
    const user = this.authService.getUser();
    this.userAvatar = user?.avatar || null;
  }

  logout(): void {
    this.authService.logout();
    this.showLogoutMessage();
    this.router.navigate(['/login']);
  }

  showLogoutMessage(): void {
    this.snackBar.open('Gracias por usar nuestro sistema, vuelve pronto te esperamos', 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  showUserCard(): void {
    this.isUserCardVisible = true;
  }

  handleUserItemClick(label: string): void {
    if (label === 'profile') {
      this.showUserCard();
    } else if (label === 'logout') {
      this.logout();
    }
    // Manejo de otros ítems del menú si es necesario
  }

  getHeadClass(): string {
    let styleClass = '';
    if (this.collapsed && this.screenWidth > 768) {
      styleClass = 'head-trimmed';
    } else {
      styleClass = 'head-md-screen';
    }
    return styleClass;
  }

  checkCanShowSearchAsOverlay(innerWidth: number): void {
    this.canShowSearchAsOverlay = innerWidth < 845;
  }
}

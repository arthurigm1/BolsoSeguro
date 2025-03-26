import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { LoginService } from '../../Services/UserService/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-divtop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './divtop.component.html',
  styleUrls: ['./divtop.component.scss'],
})
export class DivtopComponent {
  isMobileMenuOpen = false;
  isSettingsDropdownOpen = false;
  isAccountDropdownOpen = false;

  @Output() activeComponentChange = new EventEmitter<string>();
  @Output() viewChange = new EventEmitter<string>();

  constructor(
    private loginService: LoginService,
    private toastService: ToastrService
  ) {}

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  toggleSettingsDropdown(event: Event) {
    event.stopPropagation();
    this.isSettingsDropdownOpen = !this.isSettingsDropdownOpen;
    this.isAccountDropdownOpen = false;
  }

  toggleAccountDropdown(event: Event) {
    event.stopPropagation();
    this.isAccountDropdownOpen = !this.isAccountDropdownOpen;
    this.isSettingsDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (
      !target.closest('#mobile-menu-button') &&
      !target.closest('#main-nav') &&
      !target.closest('#settings-button') &&
      !target.closest('#account-button')
    ) {
      this.closeMobileMenu();
      this.isSettingsDropdownOpen = false;
      this.isAccountDropdownOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth >= 768) {
      this.closeMobileMenu();
    }
  }

  // Outros métodos permanecem iguais
  alterarComponente(componente: string) {
    this.viewChange.emit(componente);
    this.closeMobileMenu();
  }

  mudarPagina(pagina: string, activeComponent: string) {
    this.viewChange.emit(pagina);
    this.activeComponentChange.emit(activeComponent);
    this.closeMobileMenu();
  }

  logout() {
    this.loginService.logout();
    this.toastService.info('Logout efetuado com sucesso');
    location.reload();
  }
}

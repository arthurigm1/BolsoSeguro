import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { LoginService } from '../../Services/UserService/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-divtop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './divtop.component.html',
  styleUrl: './divtop.component.scss',
})
export class DivtopComponent {
  isSettingsDropdownOpen = false; // Controla o dropdown de configurações
  isAccountDropdownOpen = false; // Controla o dropdown da conta
  @Output() activeComponentChange = new EventEmitter<string>();
  @Output() viewChange: EventEmitter<string> = new EventEmitter<string>();
  constructor(
    private loginService: LoginService,
    private toastService: ToastrService
  ) {}
  alterarComponente(componente: string): void {
    this.viewChange.emit(componente);
  }
  @Output() pageSelected = new EventEmitter<string>();

  mudarPagina(pagina: string, activeComponent: string) {
    this.viewChange.emit(pagina); // Troca para 'configuracoes'
    this.activeComponentChange.emit(activeComponent); // Define o subcomponente
  }
  onSelectPage(page: string): void {
    this.pageSelected.emit(page);
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const settingsButton = document.getElementById('settings-button');
    const accountButton = document.getElementById('account-button');

    if (
      !settingsButton?.contains(event.target as Node) &&
      !document
        .getElementById('settings-dropdown')
        ?.contains(event.target as Node)
    ) {
      this.isSettingsDropdownOpen = false;
    }

    if (
      !accountButton?.contains(event.target as Node) &&
      !document
        .getElementById('account-dropdown')
        ?.contains(event.target as Node)
    ) {
      this.isAccountDropdownOpen = false;
    }
  }

  // Alterna o estado do dropdown da conta (Click)
  toggleAccountDropdown(event: Event) {
    event.stopPropagation();
    this.isAccountDropdownOpen = !this.isAccountDropdownOpen;
  }

  // Abre o dropdown ao passar o mouse

  openAccountDropdown() {
    this.isAccountDropdownOpen = true;
  }

  // Fecha o dropdown ao sair com o mouse
  closeSettingsDropdown() {
    this.isSettingsDropdownOpen = false;
  }

  closeAccountDropdown() {
    this.isAccountDropdownOpen = false;
  }

  settingsTimeout: any;

  openSettingsDropdown() {
    clearTimeout(this.settingsTimeout); // Impede que o menu feche imediatamente
    this.isSettingsDropdownOpen = true;
  }

  delayedCloseSettingsDropdown() {
    this.settingsTimeout = setTimeout(() => {
      this.isSettingsDropdownOpen = false;
    }, 200); // Pequeno delay para evitar fechamento imediato
  }

  toggleSettingsDropdown(event: Event) {
    event.stopPropagation(); // Impede que o clique feche o menu imediatamente
    this.isSettingsDropdownOpen = !this.isSettingsDropdownOpen;
  }
  logout(): void {
    this.loginService.logout();
    this.toastService.info('Logout efetuado com sucesso');
    location.reload();
  }
}

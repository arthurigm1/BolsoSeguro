import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { LoginService } from '../../Services/UserService/login.service';
import { ToastrService } from 'ngx-toastr';
import { ExchangeRateService } from '../../Services/exchange-rate.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-divtop',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    private toastService: ToastrService,
    private exchangeRateService: ExchangeRateService
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
  isModalOpen: boolean = false;

  // Dados da conversão
  fromCurrency: string = 'USD';
  toCurrency: string = 'BRL';
  amount: number = 1;
  convertedAmount: number | null = null;

  // Lista de moedas (pode ser expandida)
  currencies: string[] = ['USD', 'EUR', 'BRL', 'GBP', 'JPY', 'CAD', 'AUD'];

  // Taxas de câmbio
  exchangeRates: any = {};

  // Estados adicionais
  isLoading: boolean = false;
  error: string | null = null;

  // Abre o modal e carrega as taxas
  abrirModal() {
    this.isModalOpen = true;
    this.getRates();
  }

  // Fecha o modal
  fecharModal() {
    this.isModalOpen = false;
    this.resetConversion();
  }

  // Carrega as taxas de câmbio
  getRates() {
    this.isLoading = true;
    this.error = null;

    this.exchangeRateService.getExchangeRates().subscribe({
      next: (data) => {
        this.exchangeRates = data.conversion_rates;
        this.isLoading = false;
        // Converte automaticamente ao carregar as taxas
        this.convert();
      },
      error: (err) => {
        this.error = 'Erro ao carregar as taxas. Tente novamente.';
        this.isLoading = false;
        console.error('Erro:', err);
      },
    });
  }

  // Realiza a conversão
  convert() {
    if (!this.amount || isNaN(this.amount)) {
      this.error = 'Insira um valor válido';
      this.convertedAmount = null;
      return;
    }

    if (
      !this.exchangeRates[this.fromCurrency] ||
      !this.exchangeRates[this.toCurrency]
    ) {
      this.error = 'Taxas de câmbio não disponíveis';
      this.convertedAmount = null;
      return;
    }

    this.error = null;

    // Calcula a taxa correta (considerando que a API retorna taxas baseadas em USD)
    const rate =
      this.exchangeRates[this.toCurrency] /
      this.exchangeRates[this.fromCurrency];
    this.convertedAmount = this.amount * rate;
  }

  // Inverte as moedas selecionadas
  inverterMoedas() {
    [this.fromCurrency, this.toCurrency] = [this.toCurrency, this.fromCurrency];
    this.convert();
  }

  // Reseta os valores da conversão
  resetConversion() {
    this.convertedAmount = null;
    this.error = null;
  }
}

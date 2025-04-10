import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  OnInit,
} from '@angular/core';
import { LoginService } from '../../Services/UserService/login.service';
import { ToastrService } from 'ngx-toastr';
import { ExchangeRateService } from '../../Services/exchange-rate.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-divtop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './divtop.component.html',
  styleUrls: ['./divtop.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),
  ],
})
export class DivtopComponent implements OnInit {
  isMobileMenuOpen = false;
  isSettingsDropdownOpen = false;
  isAccountDropdownOpen = false;
  isModalOpen = false;
  isLoading = false;
  error: string | null = null;
  amount: number = 0;
  fromCurrency: string = 'USD';
  toCurrency: string = 'BRL';
  currencies: string[] = [
    'USD',
    'EUR',
    'GBP',
    'BRL',
    'JPY',
    'CAD',
    'AUD',
    'CHF',
  ];
  exchangeRates: { [key: string]: number } = {};
  convertedAmount: number | null = null;

  @Output() activeComponentChange = new EventEmitter<string>();
  @Output() viewChange = new EventEmitter<string>();

  constructor(
    private loginService: LoginService,
    private toastService: ToastrService,
    private exchangeRateService: ExchangeRateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExchangeRates();
  }

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
    this.router.navigate(['/login']);
  }

  abrirModal() {
    this.isModalOpen = true;
    this.loadExchangeRates();
  }

  fecharModal() {
    this.isModalOpen = false;
    this.error = null;
    this.convertedAmount = null;
  }

  async loadExchangeRates(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      // Aqui você implementaria a chamada real à API de câmbio
      // Por enquanto, vamos simular com dados mockados
      this.exchangeRates = {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        BRL: 5.2,
        JPY: 110.5,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
      };
      this.convert();
    } catch (err) {
      this.error =
        'Erro ao carregar taxas de câmbio. Tente novamente mais tarde.';
    } finally {
      this.isLoading = false;
    }
  }

  convert() {
    if (
      !this.amount ||
      !this.exchangeRates[this.fromCurrency] ||
      !this.exchangeRates[this.toCurrency]
    ) {
      this.convertedAmount = null;
      return;
    }

    const rate =
      this.exchangeRates[this.toCurrency] /
      this.exchangeRates[this.fromCurrency];
    this.convertedAmount = this.amount * rate;
  }

  inverterMoedas() {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;
    this.convert();
  }

  getInitials(): string {
    const nome = this.getNome();
    return nome
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getNome(): string {
    // Implementar lógica para obter o nome do usuário do serviço de login
    return 'Usuário Teste';
  }

  getEmail(): string {
    // Implementar lógica para obter o email do usuário do serviço de login
    return 'usuario@teste.com';
  }

  getCurrentDate(): Date {
    return new Date();
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  menuOpen = false;
  navLinks = [
    { path: '/quem-somos', label: 'Quem somos' },
    { path: '#faq', label: 'FAQ' },
    { path: '#planos', label: 'Planos' },
  ];

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}

import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateY(-100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class HeaderComponent {
  constructor(private router: Router) {}
  menuOpen = false;
  navLinks = [
    { path: '/quem-somos', label: 'Quem somos' },
    { path: '#faq', label: 'FAQ' },
    { path: '#planos', label: 'Planos' },
  ];

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  navigateTo(path: string): void {
    this.menuOpen = false;
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      this.router.navigateByUrl(path);
    }
  }
}

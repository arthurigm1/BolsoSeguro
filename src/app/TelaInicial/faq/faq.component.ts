import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  faqs = [
    {
      question: 'Como posso cadastrar minhas contas no BolsoSeguro?',
      answer:
        'Você pode cadastrar suas contas no BolsoSeguro de forma simples e rápida pelo aplicativo, basta acessar a seção "Minhas Contas" e adicionar as informações dos seus bancos e cartões de crédito.',
      open: false,
    },
    {
      question: 'O BolsoSeguro cobra taxas para utilizar?',
      answer:
        'O BolsoSeguro oferece um plano gratuito com funcionalidades básicas. Caso deseje funcionalidades adicionais, como a conexão com contas bancárias e geração de relatórios avançados, você pode assinar um plano premium.',
      open: false,
    },
    {
      question:
        'O BolsoSeguro é seguro para armazenar minhas informações financeiras?',
      answer:
        'Sim, o BolsoSeguro utiliza criptografia de ponta a ponta para garantir a segurança das suas informações financeiras. Seus dados são protegidos com os mais altos padrões de segurança da indústria.',
      open: false,
    },
    {
      question: 'Posso acessar o BolsoSeguro de qualquer dispositivo?',
      answer:
        'Sim, o BolsoSeguro possui versões para Android, iOS e Web. Seus dados são sincronizados automaticamente entre os dispositivos, para que você tenha acesso às suas finanças de qualquer lugar.',
      open: false,
    },
  ];

  toggleFAQ(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }
}

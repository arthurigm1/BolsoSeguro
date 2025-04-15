# 💰 BolsoSeguro

**BolsoSeguro** é uma aplicação web de controle financeiro pessoal, desenvolvida com **Angular** no front-end e **Spring Boot** no back-end. O objetivo do projeto é ajudar usuários a **gerenciar contas, cartões, despesas, receitas, metas financeiras e relatórios** de forma simples, visual e segura.

---

## 📸 Demonstração

![image](https://github.com/user-attachments/assets/30e7bf1f-d1a3-4772-8f7c-2b851bec791b)

---

## 🚀 Funcionalidades

### ✅ Controle Financeiro

- Cadastro e edição de **contas bancárias**
- Inclusão e gerenciamento de **despesas** e **receitas**
- Organização por **categorias** (personalizáveis)
- Visualização de **saldo total**, **saldo por mês** e por **categoria**

### 💳 Cartões de Crédito

- Cadastro de **cartões de crédito**
- Lançamento de **transações na fatura** com data, valor e categoria
- Visualização de **limite total**, **limite disponível** e **valor utilizado**
- Geração de **faturas em PDF** com dados detalhados

### 📊 Análises e Relatórios

- **Gráficos interativos** com Chart.js:
  - Distribuição por categoria
  - Evolução mensal de receitas e despesas
  - Comparativos entre contas e cartões
- Exportação de **relatórios de transações em PDF** com **iText**
- Linha do tempo financeira com visualização diária de fluxo de saldo

### 🧾 Metas e Planejamento

- Cadastro e visualização de **metas financeiras mensais**
- Acompanhamento do progresso de cada meta por categoria ou conta
- Destaque visual de metas atingidas ou em andamento

### 🌍 Conversão de Moedas

- Conversão automática de valores com base em **API externa de câmbio**
- Visualização de saldo em múltiplas moedas (BRL, USD, EUR, etc.)

### 🔒 Segurança

- Login com **autenticação JWT**
- Acesso **protegido por usuário**
- Dados isolados por conta e ambiente autenticado

---

## 🛠️ Tecnologias Utilizadas

### 📦 Back-End

- **Java 17**
- **Spring Boot 3.4.4**
- Spring Security + JWT
- Spring Data JPA + Hibernate
- PostgreSQL
- JasperReports para geração de relatórios
- Flyway (migrations)
- Docker (containerização)
- GitHub Actions (CI/CD)
- **iText PDF** para geração de documentos personalizados

### 🌐 Front-End

- **Angular 17+** (com standalone components)
- **Tailwind CSS** para estilização responsiva
- **Chart.js** para gráficos financeiros
- Angular Animations para transições modernas
- Arquitetura modular baseada em componentes reativos
- Experiência otimizada para **mobile e desktop**

---

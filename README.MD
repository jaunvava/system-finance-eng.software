# Sistema de Finanças Pessoais

Um projeto desenvolvido para a disciplina de **Engenharia de Software 1**, focado em oferecer uma ferramenta simples, intuitiva e eficiente para o controle financeiro pessoal.

## Sobre o Projeto

Este sistema foi concebido para ajudar usuários a gerenciarem suas economias diárias. Através de uma interface moderna e responsiva, é possível registrar receitas, despesas, definir orçamentos e visualizar o desempenho financeiro por meio de gráficos detalhados.

O sistema opera inteiramente no lado do cliente (Client-side), utilizando o **LocalStorage** do navegador para persistência de dados, o que elimina a necessidade de um servidor backend para uso básico e estudo.

---

## Funcionalidades

### Dashboard Interativo

- Visualização rápida do **Saldo Total**, **Receitas** e **Despesas**.
- Resumo visual do status financeiro atual.

### Gestão de Transações

- Registro completo de entradas (receitas) e saídas (despesas).
- Histórico detalhado com descrição, valor e categoria.
- Capacidade de edição e exclusão de registros.

### Categorias Personalizáveis

- Organização de gastos por categorias (Ex: Alimentação, Transporte, Lazer, etc).
- Adição de novas categorias conforme a necessidade do usuário.

### Relatórios e Gráficos

- Visualização gráfica do comportamento das finanças utilizando **Chart.js**.
- Análise de gastos por período ou categoria para melhor tomada de decisão.

### Controle de Orçamentos

- Definição de metas de gastos para categorias específicas.
- Acompanhamento em tempo real do quanto já foi utilizado do orçamento planejado.

---

## Tecnologias Utilizadas

O projeto utiliza tecnologias modernas de desenvolvimento web para garantir performance e boa experiência do usuário:

- **HTML5** & **CSS3**: Estrutura e estilização Layout.
- **JavaScript (ES6+)**: Lógica de negócio, manipulação de DOM e persistência local.
- **[Bootstrap 5](https://getbootstrap.com/)**: Framework CSS para componentes e layout grid.
- **[Chart.js](https://www.chartjs.org/)**: Biblioteca para criação de gráficos interativos.
- **[Font Awesome 6](https://fontawesome.com/)**: Ícones
- **Google Fonts**: Tipografias **Oswald** (títulos) e **Inter** (corpo de texto).

---

## Estrutura do Projeto

```bash
eng-soft-1/
├── public/          # Ativos estáticos
├── src/             # Código-fonte principal
│   ├── categorias/  # Módulo de Categorias (HTML/JS)
│   ├── dashboard/   # Módulo Inicial (HTML/JS)
│   ├── orcamentos/  # Módulo de Orçamentos (HTML/JS)
│   ├── relatorios/  # Módulo de Gráficos (HTML/JS)
│   ├── transacoes/  # Módulo de Transações (HTML/JS)
│   ├── main.html    # Ponto de entrada da aplicação
│   ├── script.js    # Lógica de navegação e manipulação de dados centralizada
│   └── style.css    # Estilos globais e design
└── README.md        # Documentação do projeto
```

---

## Como Executar

Por ser uma aplicação baseada em tecnologias web padrão e persistência local, não é necessária a instalação de dependências ou servidores.

1.  Faça o clone do repositório:
    ```bash
    git clone https://github.com/jaunvava/eng-soft-1.git
    ```
2.  Navegue até a pasta do projeto e entre em `src/`:
3.  Abra o arquivo **`main.html`** em qualquer navegador

---

## Contribuidores

- **João Pedro (jaunvava)** - _Desenvolvimento e Coordenação_
- **Alisson Lira** - _Módulo de Transações e Integração_
- **Rikelme Martins** - _Desenvolvimento e Testes_

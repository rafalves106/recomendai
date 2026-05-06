<div align="center">
<h1>🤖 Recomenda.AI</h1>
<p><strong>Sistema de Recomendação com Inteligência Artificial para E-commerce</strong></p>

![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

</div>

---

## 📋 Sobre o Projeto

O **Recomenda.AI** é uma startup fictícia de tecnologia desenvolvida como projeto acadêmico, que simula um sistema SaaS (Software as a Service) de recomendação personalizada de produtos para e-commerce com base em Inteligência Artificial.

O sistema analisa o comportamento de navegação dos usuários — visualizações, buscas, adições ao carrinho e compras — e utiliza um **motor de recomendação híbrido** para entregar sugestões personalizadas em tempo real, aumentando a taxa de conversão e o ticket médio das lojas integradas.

### 🎯 Proposta de Valor

| Para quem                      | O que entrega                                           |
| ------------------------------ | ------------------------------------------------------- |
| Pequenas e médias lojas online | Personalização de experiência sem equipe de dados       |
| Gestores de e-commerce         | Aumento de conversão, ticket médio e fidelização        |
| Times de marketing             | Insights sobre comportamento e preferências de clientes |

---

## 🏗️ Arquitetura

┌─────────────────────────────────────────────────────┐ │ RECOMENDA.AI │ ├─────────────────┬───────────────────────────────────┤ │ FRONTEND │ BACKEND │ │ React + TS │ Python + FastAPI │ │ │ │ │ ┌──────────┐ │ ┌─────────────────────────┐ │ │ │ Loja │◄──┼──►│ API REST / Endpoints │ │ │ │ Virtual │ │ └────────────┬────────────┘ │ │ └──────────┘ │ │ │ │ ┌──────────┐ │ ┌────────────▼────────────┐ │ │ │Dashboard │◄──┼──►│ Motor de Recomendação │ │ │ │ Admin │ │ │ (Híbrido: popularidade │ │ │ └──────────┘ │ │ + coocorrência + perfil│ │ │ │ └────────────┬────────────┘ │ │ │ │ │ │ │ ┌────────────▼────────────┐ │ │ │ │ SQLite │ │ │ │ │ (produtos, usuários, │ │ │ │ │ eventos) │ │ │ │ └─────────────────────────┘ │ └─────────────────┴───────────────────────────────────┘ ▲ ┌─────────────┴─────────────┐ │ Script de Simulação │ │ simulate_users.py │ │ (50 perfis de usuários) │ └───────────────────────────┘

---

## 🚀 Tecnologias

### Frontend

- **React 18** + **TypeScript** — Interface da loja e dashboard
- **Vite** — Build tool e dev server
- **Tailwind CSS** + **shadcn/ui** — Estilização e componentes
- **Recharts** — Gráficos e visualizações do dashboard
- **Zustand** — Gerenciamento de estado global
- **Axios** — Comunicação com a API
- **React Router DOM** — Roteamento de páginas

### Backend

- **Python 3.11+** — Linguagem principal
- **FastAPI** — Framework web assíncrono
- **SQLAlchemy** — ORM e queries SQL
- **SQLite** — Banco de dados local
- **Pydantic** — Validação de dados e schemas
- **Uvicorn** — Servidor ASGI

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) 18+
- [Python](https://python.org/) 3.11+
- [Git](https://git-scm.com/)

> **Mac (Homebrew):** `brew install node python`
> **Windows:** Use os instaladores oficiais dos links acima
> **Linux:** `sudo apt install nodejs python3 python3-pip`

---

## ⚙️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/recomenda-ai.git
cd recomenda-ai

2. Configure o Frontend
bash

cd frontend
npm install

Crie o arquivo de variáveis de ambiente:
bash

cp .env.example .env

Conteúdo do .env do frontend:
env

VITE_API_URL=http://localhost:8000

3. Configure o Backend
bash

cd backend

# Crie o ambiente virtual
python -m venv venv

# Ative o ambiente virtual
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Instale as dependências
pip install -r requirements.txt

Crie o arquivo de variáveis de ambiente:
bash

cp .env.example .env

Conteúdo do .env do backend:
env

DATABASE_URL=sqlite:///./data/recomenda.db
ENVIRONMENT=development

🖥️ Como Executar

Abra dois terminais na raiz do projeto.
Terminal 1 — Backend (API + Motor de IA)
bash

cd backend
source venv/bin/activate    # Mac/Linux
uvicorn app.main:app --reload --port 8000

✅ API disponível em: http://localhost:8000
📚 Documentação automática: http://localhost:8000/docs
Terminal 2 — Frontend (Loja Virtual)
bash

cd frontend
npm run dev

✅ Loja disponível em: http://localhost:5173
📊 Dashboard admin em: http://localhost:5173/admin
(Opcional) Simulação de Usuários

Abra um terceiro terminal para rodar a simulação em background:
bash

cd backend
source venv/bin/activate

# Modo batch: gera histórico de eventos (rode antes de gravar o vídeo)
python scripts/simulate_users.py --mode batch --events 5000

# Modo live: gera eventos em tempo real (rode durante a demonstração)
python scripts/simulate_users.py --mode live --interval 2

📁 Estrutura do Projeto

recomenda-ai/
│
├── frontend/                    # Interface React + TypeScript
│   └── src/
│       ├── components/          # Componentes reutilizáveis (cards, navbar...)
│       ├── pages/               # Páginas (Home, Produto, Carrinho, Admin...)
│       ├── hooks/               # Custom hooks (useCart, useRecommendations...)
│       ├── services/            # Integração com a API (axios)
│       ├── store/               # Estado global (Zustand)
│       ├── types/               # Interfaces e tipos TypeScript
│       └── utils/               # Funções auxiliares
│
├── backend/                     # API Python + Motor de IA
│   ├── app/
│   │   ├── main.py              # Entry point da aplicação
│   │   ├── database.py          # Configuração do SQLite
│   │   ├── models/              # Modelos de dados (Pydantic + SQLAlchemy)
│   │   ├── routes/              # Endpoints REST
│   │   ├── services/            # Lógica de negócio
│   │   └── engine/              # Motor de recomendação híbrido
│   ├── scripts/
│   │   └── simulate_users.py    # Simulação de comportamento de usuários
│   └── data/                    # Banco SQLite (não versionado)
│
├── docs/                        # Documentação complementar
│   ├── arquitetura.md
│   └── como-rodar.md
│
├── .gitignore
├── .editorconfig
├── docker-compose.yml
└── README.md

🔌 Principais Endpoints da API
Método	Endpoint	Descrição
GET	/products	Lista todos os produtos
GET	/products/{id}	Detalhe de um produto
GET	/products?category=eletronicos	Filtra por categoria
POST	/events	Registra evento de comportamento
GET	/recommendations/{user_id}	Recomendações personalizadas
GET	/recommendations/item/{product_id}	"Quem viu isso também viu"
GET	/analytics/overview	KPIs gerais para o dashboard
GET	/analytics/top-products	Produtos mais vistos/comprados
GET	/analytics/events/live	Feed de eventos em tempo real

    📚 Documentação interativa completa disponível em http://localhost:8000/docs (Swagger UI)

🧠 Como Funciona o Motor de Recomendação

O Recomenda.AI utiliza uma abordagem híbrida em 3 camadas:

1. POPULARIDADE (fallback)
 └─ Para novos usuários sem histórico
 └─ Mostra os produtos mais vistos/comprados globalmente

2. COOCORRÊNCIA ITEM-ITEM
 └─ "Quem viu/comprou X também viu/comprou Y"
 └─ Calculado a partir de sessões compartilhadas

3. PERFIL DO USUÁRIO
 └─ Detecta categorias preferidas por frequência de eventos
 └─ Filtra e ordena produtos não vistos nessas categorias

O motor seleciona automaticamente a melhor estratégia baseado no histórico disponível do usuário.


📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.
Distribuído sob a licença MIT.
```

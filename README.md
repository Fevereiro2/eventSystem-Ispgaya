# Event System ISPGAYA - Guia de Organização do Projeto

## 📂 Nova Estrutura do Projeto

O projeto está agora dividido de forma lógica para separar as diferentes responsabilidades:

### 1. Backend (`/backend`)
O backend utiliza Django (Python) e está organizado para separar a lógica de negócio da infraestrutura:

*   **`infocultura/api/`**: Contém os `serializers.py` (transformação de dados) e modelos Pydantic. Aqui é onde defines como os dados entram e saem da tua API.
*   **`infocultura/core/`**: Contém a lógica central de segurança, autenticação e permissões. Separar isto ajuda a manter o resto do código limpo.
*   **`infocultura/database/`**: Aqui encontras tudo o que diz respeito à base de dados SQL direta e modelos SQLAlchemy (usados para scripts avançados).
*   **`infocultura/services.py`**: Centraliza a lógica de negócio e operações CRUD complexas. Toda a manipulação de dados agora passa pelo ORM, garantindo integridade referencial.
*   **Funcionalidade de Agendamento (Scheduling)**: O sistema agora suporta agendamento completo de eventos e sessões, incluindo:
    *   Validação automática de intervalos (data de fim > data de início).
    *   Estados de atividade (Ativo, Concluído, Cancelado).
    *   Filtros inteligentes para atividades próximas, passadas e intervalos de datas.
*   **`infocultura/scripts/`**: Scripts utilitários para manutenção da base de dados e geração de esquemas.
*   **`infocultura/management/`**: Comandos personalizados do Django (ex: enviar lembretes).

**Porquê assim?** No mundo real, não queres misturar "quem pode aceder" (Segurança) com "como o dado é guardado" (Base de Dados). Esta separação facilita a manutenção e os testes unitários.

---

### 2. Frontend (`/src`)
O frontend em React foi organizado para ser modular e reutilizável:

*   **`api/`**: Toda a comunicação com o servidor está centralizada aqui (`infoculturaApi.ts`). Se o URL do servidor mudar, só precisas de mexer num ficheiro.
*   **`components/layout/`**: Componentes que definem a estrutura da página (Header, Footer, TopBar).
*   **`components/ui/`**: Componentes visuais pequenos e reutilizáveis (Botões, Cards, Breadcrumbs). Isto segue o conceito de *Atomic Design*.
*   **`pages/`**: Cada ficheiro aqui representa uma rota (página completa) da aplicação.
*   **`assets/`**: Imagens, logos e fotos de fundo.
*   **`styles/`**: Definições globais de estilo (Tailwind/UI).

---

## 🚀 Mudanças Importantes para Entenderes

Para dominares este projeto, foca-te nestes 3 pontos:

1.  **Fluxo de Dados**:
    *   O React pede dados ao `src/api/infoculturaApi.ts`.
    *   O Django recebe no `views.py`.
    *   O `views.py` usa o `serializers.py` (em `api/`) para validar os dados.
    *   O `models.py` interage com a Base de Dados.

2.  **Segurança Centralizada**:
    *   Se quiseres mudar como o login funciona, vais a `backend/infocultura/core/security.py`. Não precisas de procurar por todo o projeto.

3.  **Componentização**:
    *   Sempre que criares algo novo no ecrã, pergunta-te: "Isto é uma página inteira ou um pedaço que posso reutilizar?". Se for reutilizável, cria um componente em `src/components/ui/`.

## � Mudanças Recentes (Soft-Delete Unification)

### O Que Mudou

O sistema foi refatorizado para usar **soft-delete** (desativação lógica) em vez de eliminação permanente. Isto significa que quando um utilizador, clube, evento, etc. é "eliminado", na verdade é apenas marcado como inativo.

**Benefícios:**
- ✅ Nenhuma perda de dados
- ✅ Histórico completo mantido
- ✅ Possibilidade de reativar itens
- ✅ Auditoria completa de todas as ações
- ✅ Reversibilidade de operações

### Documentação das Mudanças

Para entenderes todas as mudanças implementadas, consulta:

1. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumo completo das mudanças
2. **[SOFT_DELETE_CHANGES.md](./SOFT_DELETE_CHANGES.md)** - Detalhes técnicos do backend
3. **[FRONTEND_UPDATE_GUIDE.md](./FRONTEND_UPDATE_GUIDE.md)** - Como atualizar componentes do frontend
4. **[API_ENDPOINTS_REFERENCE.md](./API_ENDPOINTS_REFERENCE.md)** - Referência de endpoints

### Endpoints Novos

Todos os endpoints de deactivate/activate para gerenciamento de entidades:

```
POST /api/clubs/admin/{id}/deactivate/
POST /api/clubs/admin/{id}/activate/
POST /api/events/admin/{id}/deactivate/
POST /api/events/admin/{id}/activate/
POST /api/news/admin/{id}/deactivate/
POST /api/news/admin/{id}/activate/
POST /api/books/admin/{id}/deactivate/
POST /api/books/admin/{id}/activate/
POST /api/sessions/admin/{id}/deactivate/
POST /api/sessions/admin/{id}/activate/
```

### APIs Frontend Novas

Novas funções em `src/api/admin.ts`:

```typescript
deactivateAdminClub()
activateAdminClub()
deactivateAdminEvent()
activateAdminEvent()
deactivateAdminNews()
activateAdminNews()
deactivateAdminBook()
activateAdminBook()
deactivateAdminSession()
activateAdminSession()
deactivateAdminClubMember()
```

## 🧭 Organização e Paradigmas

Consulta [docs/architecture.md](./docs/architecture.md) para a visão estruturada do projeto.

Resumo curto:

- o frontend está dividido por páginas, componentes, hooks, api e utils
- o backend separa modelos, serializers, views e serviços
- no backend, Django é MVT, mas a organização segue a lógica do MVC
- a POO aparece nos modelos e na lógica encapsulada por classes e serviços

## �🛠️ Como Executar

### Backend
1. Navega para `backend/`.
2. Cria um ambiente virtual: `python -m venv venv`.
3. Instala dependências: `pip install -r requirements.txt`.
4. Executa: `python manage.py runserver 8001`.

### Frontend
1. Na pasta raiz, instala dependências: `npm install`.
2. Para ativar autocomplete de moradas/locais com Google Maps no formulário de eventos, define `VITE_GOOGLE_MAPS_API_KEY` no ficheiro `.env`.
3. Executa em modo desenvolvimento: `npm run dev`.

Este projeto é uma excelente base para estudares **Arquitetura de Software**. Diverte-te a explorar!

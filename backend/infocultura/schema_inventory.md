# Inventario de Schema

Fonte principal:
- `backend/infocultura/database/sqlalchemy_live_schema.sql`
- `backend/infocultura/database/sqlalchemy_live_models.py`
- `backend/infocultura/models.py`

Objetivo:
- documentar a PK real
- listar as colunas reais conhecidas
- explicitar as relacoes
- separar tabelas ORM de SQL direto

## Regras de leitura

- **ORM managed**: tabela ligada a `models.py` e/ou `sqlalchemy_live_models.py`.
- **SQL direto**: tabela composta ou fluxos em que o backend usa `INSERT`/`SELECT` manual.
- **Legacy mirror**: tabela/coluna existente apenas no espelho historico `sqlalchemy_schema.sql`.

## Inventario

| Table | PK real | Colunas reais | Relacoes | Acesso |
|---|---|---|---|---|
| `roles` | `id` | `id`, `name`, `description` | `users.role_id -> roles.id` | ORM managed |
| `users` | `id` | `id`, `name`, `email`, `password_hash`, `role_id`, `is_active`, `created_at`, `id_clubs` | `role_id -> roles.id`; `id_clubs -> clubs.id_clubs` | ORM managed |
| `clubs` | `id_clubs` | `id_clubs`, `name`, `description`, `mission`, `image`, `is_active`, `created_at`, `enable_registrations` | referenced by users, books, sessions, news and club registrations | ORM managed |
| `nstatus` | `id_nstatus` | `id_nstatus`, `name`, `description` | `news.id_nstatus -> nstatus.id_nstatus` | ORM managed |
| `news` | `id_news` | `id_news`, `title`, `summary`, `image`, `is_active`, `id_nstatus`, `published_at`, `id_clubs`, `content`, `updated_at`, `created_at` | `id_nstatus -> nstatus.id_nstatus`; `id_clubs -> clubs.id_clubs` | ORM managed |
| `books` | `id_books` | `id_books`, `title`, `author`, `publisher`, `publication_year`, `cover_image`, `summary`, `is_active`, `is_featured`, `id_club`, `created_at` | `id_club -> clubs.id_clubs` | ORM managed |
| `sessions` | `id_sessions` | `id_sessions`, `name`, `title`, `description`, `session_date`, `start_date`, `end_date`, `is_active`, `id_club`, `updated_at`, `created_at` | `id_club -> clubs.id_clubs` | ORM managed |
| `category` | `id_category` | `id_category`, `name`, `description`, `updated_at`, `created_at` | many-to-many with `event` through `event_category` | ORM managed |
| `event` | `id_event` | `id_event`, `title`, `description`, `event_date`, `start_date`, `end_date`, `image`, `is_active`, `is_external`, `status`, `city`, `location`, `user_id`, `updated_at`, `created_at` | `user_id -> users.id`; many-to-many with `category` and `registrations` | ORM managed |
| `event_category` | `(id_event, id_category)` | `id_event`, `id_category` | `event.id_event -> event.id_event`; `category.id_category -> category.id_category` | ORM managed |
| `registrations` | `id_registrations` | `id_registrations`, `name`, `email`, `phone`, `message`, `status`, `created_at`, `id_rstatus` | `id_rstatus -> rstatus.id_rstatus`; joined by all registration link tables | ORM managed |
| `rstatus` | `id_rstatus` | `id_rstatus`, `name`, `description` | `registrations.id_rstatus -> rstatus.id_rstatus` | ORM managed |
| `clubs_registrations` | `(id_clubs, id_registrations)` | `id_clubs`, `id_registrations` | `clubs.id_clubs -> clubs_registrations.id_clubs`; `registrations.id_registrations -> clubs_registrations.id_registrations` | SQL direto nos fluxos de inscricao |
| `event_registrations` | `(id_event, id_registrations)` | `id_event`, `id_registrations`, `created_at`, `reminder_sent_at` | `event.id_event -> event_registrations.id_event`; `registrations.id_registrations -> event_registrations.id_registrations` | SQL direto nos fluxos de inscricao |
| `session_registrations` | `(id_sessions, id_registrations)` | `id_sessions`, `id_registrations`, `created_at`, `reminder_sent_at` | `sessions.id_sessions -> session_registrations.id_sessions`; `registrations.id_registrations -> session_registrations.id_registrations` | SQL direto nos fluxos de inscricao |
| `infocultura_culturalcontent` | `id` | `id` (UUID), `area`, `title`, `description`, `date`, `status`, `updated_at`, `created_at` | table de conteudo cultural publico | ORM managed |
| `newsletters` | `id_newsletter` | `id_newsletter`, `title`, `subject`, `content`, `status`, `sent_at`, `user_id`, `created_at` | `user_id -> users.id` | ORM managed |
| `news_letter_subscribers` | `id_newsletter_sub` | `id_newsletter_sub`, `email`, `is_active`, `subscribed_at` | unique on `email` | ORM managed |
| `metric_views` | `id_metric_view` | `id_metric_view`, `kind`, `section`, `content_type`, `object_id`, `title`, `page_path`, `locale`, `referrer`, `user_agent`, `visitor_key`, `club_id`, `viewed_at`, `created_at` | `club_id -> clubs.id_clubs` | ORM managed |

## Tabelas legacy que o repositorio ainda conhece, mas que nao estao espelhadas nos DDLs com a mesma clareza

- `editorial_actions`
  - colunas do modelo Django: `content_type`, `object_id`, `from_status`, `to_status`, `actor_user_id`, `actor_name`, `club_id`, `created_at`
  - o repo usa esta tabela para auditoria editorial
  - nao existe espelho coerente nos ficheiros `sqlalchemy_*` atuais

- `admin_audit_logs`
  - colunas do modelo Django: `action`, `content_type`, `object_id`, `summary`, `actor_user_id`, `actor_name`, `club_id`, `metadata_json`, `created_at`
  - o repo usa esta tabela para auditoria administrativa
  - nao existe espelho coerente nos ficheiros `sqlalchemy_*` atuais

## Divergencias historicas que convem nao reintroduzir

- `roles` usa `id` no schema live atual; o espelho antigo `sqlalchemy_schema.sql` ainda tem `id_role`.
- `users` usa `role_id` para a FK, nao `id_role`.
- `clubs_registrations`, `event_registrations` e `session_registrations` nao tem PK singular `id`; a chave real e composta.
- Os fluxos de inscricao usam SQL direto nestas tabelas compostas para evitar o ORM inferir uma coluna que nao existe.
- `metric_views` e uma tabela nova para tracking de visualizacoes; as metricas do painel agregam por `viewed_at`, `page_path` e `section`.

# Backend Django para InfoCultura (MySQL)

Backend em **Python Django + DRF** preparado para a base de dados MySQL que já criaste com as tabelas:
- `roles`
- `users`

Também inclui tabela Django para conteúdos:
- `infocultura_culturalcontent`

## Estrutura e Paradigmas

O backend está organizado por responsabilidade:

- `models.py` representa o domínio e a persistência
- `serializers.py` valida e normaliza os dados de entrada/saída
- `view_modules/` concentra a camada HTTP por área funcional
- `service_modules/` concentra regras de negócio e integrações
- `database/` mantém a camada de schema e suporte a migrações

O Django é tecnicamente **MVT**, mas a estrutura foi montada para refletir a separação típica de **MVC** e aplicar **POO** nos modelos e serviços. Isto melhora manutenção, testes e reutilização.

## 1) Setup rápido

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Editar `.env` com a tua ligação MySQL.

Depois:

```bash
python manage.py migrate
python manage.py bootstrap_infocultura
python manage.py runserver 8001
```

## 1.1) Alembic numa base de dados já existente

O projeto já tem configuração Alembic, mas a tua base MySQL atual pode já ter tabelas criadas fora destas migrations.
O `env.py` está configurado para gerir apenas a baseline live (`roles`, `users`, `clubs`, `registrations`) e ignorar tabelas do Django durante `autogenerate`.

Antes de aplicar qualquer revisão:

```bash
cd backend
source .venv/bin/activate
alembic -c alembic.ini current
python -m infocultura.inspect_schema_alignment --metadata live
```

Se a base já existir e quiseres apenas passar a controlá-la com Alembic sem recriar tabelas, faz primeiro um `stamp`:

```bash
alembic -c alembic.ini stamp head
```

Só deves correr `upgrade head` diretamente numa base vazia ou quando já confirmaste que o schema real está alinhado com o metadata SQLAlchemy:

```bash
alembic -c alembic.ini upgrade head
```

Para gerar o SQL sem aplicar:

```bash
alembic -c alembic.ini upgrade head --sql
```

## 2) Variáveis importantes (`.env`)

```env
DB_NAME=infocultura
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306
INFOCULTURA_JWT_SECRET=troca-esta-chave-jwt
INFOCULTURA_JWT_EXPIRES_HOURS=12
INFOCULTURA_ADMIN_USER=admin
INFOCULTURA_ADMIN_EMAIL=admin@ispgaya.pt
INFOCULTURA_ADMIN_PASS=cultura2026

# Eventbrite
EVENTBRITE_API_KEY=
EVENTBRITE_CLIENT_SECRET=
EVENTBRITE_PRIVATE_TOKEN=
EVENTBRITE_PUBLIC_TOKEN=
EVENTBRITE_ORGANIZATION_ID=
EVENTBRITE_DEFAULT_CURRENCY=EUR
EVENTBRITE_DEFAULT_TIMEZONE=Europe/Lisbon
EVENTBRITE_DEFAULT_COUNTRY=PT
EVENTBRITE_DEFAULT_VENUE_ID=
EVENTBRITE_TICKET_NAME=Entrada geral
```

Para ativar a integração Eventbrite, aplica a migration Alembic mais recente e configura
`EVENTBRITE_PRIVATE_TOKEN` e `EVENTBRITE_ORGANIZATION_ID`. O endpoint admin
`POST /api/events/admin/<id>/eventbrite/sync/` cria/atualiza o evento na Eventbrite; envia
`{"publish": true}` para publicar também.
`GET /api/events/admin/eventbrite/connection/` verifica se a organização configurada responde.

## 3) Como autentica

- Login usa a tabela `users` (campos `email`/`name` + `password_hash`).
- Password aceita hash Django (recomendado) e fallback plain-text (dev).
- API devolve token JWT.
- Header esperado:
  - `Authorization: Token <jwt>`  
  - também aceita `Bearer <jwt>`

## 4) Endpoints

- `GET /api/health/`
- `POST /api/auth/login/`
- `GET /api/auth/me/` (autenticado)
- `GET /api/content/` (público, default `status=publicado`)
- `GET /api/content/admin/` (roles `superadmin` ou `club_admin`)
- `POST /api/content/admin/` (roles `superadmin` ou `club_admin`)
- `PUT /api/content/admin/<uuid>/` (roles `superadmin` ou `club_admin`)
- `DELETE /api/content/admin/<uuid>/` (roles `superadmin` ou `club_admin`)

## 4.1) Ferramentas de schema

- `python -m infocultura.generate_sqlalchemy_ddl`
  - gera o DDL MySQL do schema alvo alargado em `infocultura/sqlalchemy_models.py`
- `python -m infocultura.generate_sqlalchemy_live_ddl`
  - gera o DDL MySQL da baseline real atual em `infocultura/sqlalchemy_live_models.py`
- `python -m infocultura.inspect_schema_alignment --metadata live`
  - compara a base de dados real com a baseline Alembic atual
- `python -m infocultura.inspect_schema_alignment --metadata target`
  - compara a base de dados real com o schema alvo alargado

## 5) Frontend (Vite)

Na raiz do frontend:

```env
VITE_INFOCULTURA_API=http://127.0.0.1:8001/api
```

## 6) Nota importante sobre a tua tabela `users`

Como o campo é `password_hash`, para login funcionar bem em produção usa hash real (não texto livre).
Se quiseres, gera password via Django command:

```bash
python manage.py bootstrap_infocultura
```

Este comando atualiza/cria:
- roles `superadmin` e `club_admin`
- utilizador admin na tua tabela `users`
- conteúdos seed de Tuna/Clube/Teatro

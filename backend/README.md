# Backend Django para InfoCultura (MySQL)

Backend em **Python Django + DRF** preparado para a base de dados MySQL que já criaste com as tabelas:
- `roles`
- `users`

Também inclui tabela Django para conteúdos:
- `infocultura_culturalcontent`

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
```

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

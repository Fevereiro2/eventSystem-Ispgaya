# API Endpoints Reference - Soft-Delete Pattern

## User Management (Already Existing)

### Deactivate/Activate
```
POST /api/auth/users/{id}/deactivate/
POST /api/auth/users/{id}/activate/
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "is_active": false,
    "role": {...},
    "club": {...}
  }
}
```

---

## Club Management

### Deactivate/Activate
```
POST /api/clubs/admin/{id}/deactivate/
POST /api/clubs/admin/{id}/activate/
```

**Response:**
```json
{
  "club": {
    "id": 1,
    "name": "Club Name",
    "is_active": false,
    "members": [...]
  }
}
```

### Club Member Deactivate
```
POST /api/clubs/admin/{club_id}/members/{user_id}/deactivate/
```

**Response:**
```json
{
  "user": {
    "id": 2,
    "email": "member@example.com",
    "club": null,
    "is_active": true
  }
}
```

---

## Event Management

### Deactivate/Activate
```
POST /api/events/admin/{id}/deactivate/
POST /api/events/admin/{id}/activate/
```

**Response:**
```json
{
  "event": {
    "id": 1,
    "title": "Event Title",
    "is_active": false,
    "created_at": "2025-04-01T10:00:00Z",
    "updated_at": "2025-04-01T10:01:00Z"
  }
}
```

---

## News Management

### Deactivate/Activate
```
POST /api/news/admin/{id}/deactivate/
POST /api/news/admin/{id}/activate/
```

**Response:**
```json
{
  "news": {
    "id": 1,
    "title": "News Title",
    "is_active": false,
    "status": "published",
    "created_at": "2025-04-01T10:00:00Z"
  }
}
```

---

## Book Management

### Deactivate/Activate
```
POST /api/books/admin/{id}/deactivate/
POST /api/books/admin/{id}/activate/
```

**Response:**
```json
{
  "book": {
    "id": 1,
    "title": "Book Title",
    "is_active": false,
    "isbn": "978-1234567890",
    "created_at": "2025-04-01T10:00:00Z"
  }
}
```

---

## Session Management

### Deactivate/Activate
```
POST /api/sessions/admin/{id}/deactivate/
POST /api/sessions/admin/{id}/activate/
```

**Response:**
```json
{
  "session": {
    "id": 1,
    "title": "Session Title",
    "is_active": false,
    "start_date": "2025-04-15",
    "end_date": "2025-04-20"
  }
}
```

---

## Error Responses

### Entity Not Found (404)
```json
{
  "message": "Clube nao encontrado."
}
```

### Invalid Request (400)
```json
{
  "message": "O utilizador nao pertence a este clube."
}
```

### Unauthorized (401)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Permission Denied (403)
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## Authentication

All endpoints (except public ones) require:
```
Authorization: Bearer {access_token}
```

Or cookie-based auth with `ispgaya_cultura_token`.

---

## Frontend Usage

### Example: Deactivate News

```typescript
import { deactivateAdminNews } from '../../api/admin';

async function handleDeactivateNews(id: number) {
  try {
    const updated = await deactivateAdminNews(adminToken, id);
    console.log('Deactivated:', updated);
    // Update UI with new data
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example: Activate News

```typescript
import { activateAdminNews } from '../../api/admin';

async function handleActivateNews(id: number) {
  try {
    const updated = await activateAdminNews(adminToken, id);
    console.log('Activated:', updated);
    // Update UI with new data
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Query Parameters

All list endpoints support filtering by `is_active`:

```
GET /api/news/admin/?is_active=true
GET /api/news/admin/?is_active=false
GET /api/events/admin/?is_active=true
GET /api/books/admin/?is_active=true
```

---

## Deprecated Endpoints

The following endpoints still work but are deprecated. Use soft-delete endpoints instead:

```
DELETE /api/clubs/admin/{id}/
DELETE /api/clubs/admin/{id}/members/{user_id}/
DELETE /api/events/admin/{id}/
DELETE /api/news/admin/{id}/
DELETE /api/books/admin/{id}/
DELETE /api/sessions/admin/{id}/
DELETE /api/news/admin/bulk-delete/
DELETE /api/events/admin/bulk-delete/
DELETE /api/books/admin/bulk-delete/
```

---

## Audit Trail

All deactivate/activate actions are logged with:
- **Action**: "deactivate" or "activate"
- **Content Type**: "user", "club", "event", "news", "book", "session"
- **Actor**: Admin user performing action
- **Timestamp**: Automatic (ISO 8601 format)
- **Entity ID**: ID of deactivated/activated item

View audit logs:
```
GET /api/dashboard/admin/audit/
```

---

## Testing

Use provided script:
```bash
cd backend
./test_soft_delete.sh
```

Or test manually with curl:
```bash
curl -X POST http://localhost:8000/api/clubs/admin/1/deactivate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

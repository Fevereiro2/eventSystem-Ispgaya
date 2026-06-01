# Quick Start Guide - Using Soft-Delete APIs

## Backend (Django) - Testing

### Option 1: Using Django Shell

```bash
cd backend
python manage.py shell
```

```python
from infocultura.models import Club, News, Event, Book, Session
from infocultura.view_modules.soft_delete_entity_views import AdminClubDeactivateView

# Get a club
club = Club.objects.first()
print(f"Club: {club.name}, is_active: {club.is_active}")

# Deactivate it programmatically
club.is_active = False
club.save()

# Check result
print(f"After deactivate: is_active = {club.is_active}")

# Activate it
club.is_active = True
club.save()
print(f"After activate: is_active = {club.is_active}")
```

### Option 2: Using cURL

```bash
# Get auth token first
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@example.com", "password": "password"}'

# Response contains token:
# {"token": "eyJ0eXAiOiJKV1QiLCJhbGc...", "user": {...}}

# Deactivate a club (using the token from above)
curl -X POST http://localhost:8000/api/clubs/admin/1/deactivate/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json"

# Response:
# {"club": {"id": 1, "name": "Club Name", "is_active": false, ...}}

# Activate it back
curl -X POST http://localhost:8000/api/clubs/admin/1/activate/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json"

# Response:
# {"club": {"id": 1, "name": "Club Name", "is_active": true, ...}}
```

### Option 3: Using Provided Script

```bash
cd backend
chmod +x test_soft_delete.sh
./test_soft_delete.sh
```

---

## Frontend (React) - Usage Examples

### Example 1: Deactivate a News Article

```typescript
import { useState } from 'react';
import { deactivateAdminNews, activateAdminNews } from '../../api/admin';
import { pushToast } from '../../api/client';

export function NewsItemEditor({ news, token }) {
  const [item, setItem] = useState(news);
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    if (!confirm(`Desativar "${item.title}"?`)) return;

    setLoading(true);
    try {
      const updated = await deactivateAdminNews(token, item.id);
      setItem(updated);
      pushToast({
        title: 'Notícia desativada',
        message: `"${item.title}" foi desativada com sucesso`,
        tone: 'success'
      });
    } catch (error) {
      console.error('Error:', error);
      pushToast({
        title: 'Erro',
        message: 'Não foi possível desativar a notícia',
        tone: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      const updated = await activateAdminNews(token, item.id);
      setItem(updated);
      pushToast({
        title: 'Notícia ativada',
        message: `"${item.title}" foi ativada com sucesso`,
        tone: 'success'
      });
    } catch (error) {
      console.error('Error:', error);
      pushToast({
        title: 'Erro',
        message: 'Não foi possível ativar a notícia',
        tone: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>{item.title}</h3>
      <p>Status: {item.is_active ? '✅ Ativa' : '❌ Inativa'}</p>
      {item.is_active ? (
        <button 
          onClick={handleDeactivate} 
          disabled={loading}
          className="btn btn-danger"
        >
          {loading ? 'Desativando...' : 'Desativar'}
        </button>
      ) : (
        <button 
          onClick={handleActivate} 
          disabled={loading}
          className="btn btn-success"
        >
          {loading ? 'Ativando...' : 'Ativar'}
        </button>
      )}
    </div>
  );
}
```

### Example 2: Deactivate Multiple Items (Batch)

```typescript
import { deactivateAdminEvent, activateAdminEvent } from '../../api/admin';
import { pushToast } from '../../api/client';

async function handleBulkDeactivateEvents(eventIds: number[], token: string) {
  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const id of eventIds) {
    try {
      const updated = await deactivateAdminEvent(token, id);
      results.push({ id, status: 'success', data: updated });
      successCount++;
    } catch (error) {
      results.push({ id, status: 'error', error });
      errorCount++;
    }
  }

  pushToast({
    title: 'Operação Concluída',
    message: `${successCount} evento(s) desativado(s), ${errorCount} erro(s)`,
    tone: successCount > 0 ? 'success' : 'error'
  });

  return results;
}

// Usage
const selectedEventIds = [1, 2, 3];
const results = await handleBulkDeactivateEvents(selectedEventIds, token);
console.log('Results:', results);
```

### Example 3: Deactivate Club Member

```typescript
import { deactivateAdminClubMember } from '../../api/admin';
import { pushToast } from '../../api/client';

async function removeMemberFromClub(
  clubId: number,
  userId: number,
  token: string
) {
  if (!confirm('Remover este membro do clube?')) return;

  try {
    const user = await deactivateAdminClubMember(token, clubId, userId);
    pushToast({
      title: 'Membro removido',
      message: `${user.email} foi removido do clube`,
      tone: 'success'
    });
    return user;
  } catch (error) {
    console.error('Error:', error);
    pushToast({
      title: 'Erro',
      message: 'Não foi possível remover o membro',
      tone: 'error'
    });
    throw error;
  }
}

// Usage
await removeMemberFromClub(1, 5, token);
```

### Example 4: Filter List by Active Status

```typescript
import { fetchAdminNews } from '../../api/admin';

// Get only active news
const activeNews = await fetchAdminNews(token, {
  page: 1,
  pageSize: 10,
  // is_active parameter automatically filters on backend
});

// In the future, when backend adds filter:
// const inactiveNews = await fetchAdminNews(token, {
//   page: 1,
//   pageSize: 10,
//   isActive: false  // Not yet implemented, but planned
// });
```

### Example 5: UI Toggle Button

```typescript
export function EntityStatusToggle({ entity, entityType, token, onUpdate }) {
  const [loading, setLoading] = useState(false);

  // Map entity types to API functions
  const apiMap = {
    'club': { deactivate: deactivateAdminClub, activate: activateAdminClub },
    'event': { deactivate: deactivateAdminEvent, activate: activateAdminEvent },
    'news': { deactivate: deactivateAdminNews, activate: activateAdminNews },
    'book': { deactivate: deactivateAdminBook, activate: activateAdminBook },
    'session': { deactivate: deactivateAdminSession, activate: activateAdminSession },
  };

  const { deactivate, activate } = apiMap[entityType];

  const handleToggle = async () => {
    setLoading(true);
    try {
      const fn = entity.is_active ? deactivate : activate;
      const updated = await fn(token, entity.id);
      onUpdate(updated);
      pushToast({
        title: entity.is_active ? 'Desativado' : 'Ativado',
        tone: 'success'
      });
    } catch (error) {
      pushToast({
        title: 'Erro',
        tone: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle} 
      disabled={loading}
      className={entity.is_active ? 'btn-danger' : 'btn-success'}
    >
      {loading ? '...' : (entity.is_active ? 'Desativar' : 'Ativar')}
    </button>
  );
}

// Usage
<EntityStatusToggle 
  entity={news} 
  entityType="news" 
  token={token}
  onUpdate={setNews}
/>
```

---

## Testing with Postman

### 1. Create a Collection

Name: `Event System Soft-Delete`

### 2. Add Request: Deactivate Club

```
POST {{base_url}}/api/clubs/admin/1/deactivate/
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
```

### 3. Add Request: Activate Club

```
POST {{base_url}}/api/clubs/admin/1/activate/
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
```

### 4. Set Variables

In Postman, set:
- `base_url`: http://localhost:8000
- `token`: (paste your JWT token here)

### 5. Run Requests

Click "Send" to test each endpoint.

---

## Common Errors & Solutions

### Error: "Not found"
**Cause:** Entity ID doesn't exist  
**Solution:** Check the ID is correct, fetch entity list first

### Error: "Permission denied"
**Cause:** User is not admin  
**Solution:** Use admin token, not regular user token

### Error: "User not in club"
**Cause:** Trying to remove user not in that club  
**Solution:** Verify user is member of club first

### Error: "Cannot deactivate yourself"
**Cause:** User trying to deactivate their own account  
**Solution:** Only admins can deactivate other users, not themselves

---

## Tips & Best Practices

1. **Always confirm before deactivating**
   ```typescript
   if (!confirm(`Desativar "${item.name}"?`)) return;
   ```

2. **Show loading state**
   ```typescript
   const [loading, setLoading] = useState(false);
   <button disabled={loading}>{loading ? 'Desativando...' : 'Desativar'}</button>
   ```

3. **Update UI immediately with response**
   ```typescript
   const updated = await deactivateAdminNews(token, id);
   setNews(news.map(n => n.id === id ? updated : n));
   ```

4. **Show toast notifications**
   ```typescript
   pushToast({ title: 'Sucesso', message: 'Desativado', tone: 'success' });
   ```

5. **Wrap in try-catch**
   ```typescript
   try {
     await deactivateAdminNews(token, id);
   } catch (error) {
     console.error('Error:', error);
   }
   ```

---

## Next: Test in Your Application

1. Start the server: `python manage.py runserver`
2. Get admin token via login
3. Try one of the examples above
4. Check audit logs to verify action was logged

Let's go! 🚀

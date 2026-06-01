# Frontend UI Update Guide - Soft-Delete Pattern

## Summary of Changes

This document guides the update of frontend components to use the new soft-delete (deactivate/activate) pattern instead of hard-delete.

## Files to Update

### 1. AdminCultura.tsx (Parent Component)
- Update `handleDeleteNews` → rename to `handleDeactivateNews`
- Update `handleBulkDeleteNews` → rename to `handleBulkDeactivateNews`
- Update `handleDeleteEvent` → rename to `handleDeactivateEvent`
- Update `handleBulkDeleteEvents` → rename to `handleBulkDeactivateEvents`
- Update `handleDeleteBook` → rename to `handleDeactivateBook`
- Update `handleBulkDeleteBooks` → rename to `handleBulkDeactivateBooks`
- Update `handleDeleteSession` → rename to `handleDeactivateSession`
- Update `handleDeleteCategory` → rename to `handleDeactivateCategory`

### 2. NewsPage.tsx
- Add `is_active` state tracking
- Replace `deleteAdminNews()` calls with `deactivateAdminNews()`
- Replace "Eliminar" button text with "Desativar"
- Add new "Ativar" button for inactive items
- Update bulk delete to bulk deactivate

### 3. ActivitiesPage.tsx (Books, Events, Sessions, Categories)
- Replace delete handlers with deactivate handlers
- Update button labels: "Eliminar" → "Desativar"
- Add activate buttons for inactive items
- Update API calls:
  - `deleteAdminBook()` → `deactivateAdminBook()`
  - `deleteAdminEvent()` → `deactivateAdminEvent()`
  - `deleteAdminSession()` → `deactivateAdminSession()`
  - `deleteAdminCategory()` → Keep as-is (content deletion for frontend UX)

### 4. ClubsPage.tsx
- Add `is_active` tracking
- Replace `deleteAdminClub()` with `deactivateAdminClub()`
- Add activate button for inactive clubs
- Update button label: "Eliminar" → "Desativar"

### 5. Component Props Update
All components receiving delete handlers should be updated:

**OLD:**
```typescript
handleDeleteNews: (id: number) => void | Promise<void>;
handleBulkDeleteNews: () => void | Promise<void>;
```

**NEW:**
```typescript
handleDeactivateNews: (id: number) => void | Promise<void>;
handleActivateNews: (id: number) => void | Promise<void>;
handleBulkDeactivateNews: () => void | Promise<void>;
```

## API Function Updates

### Import Changes
```typescript
// OLD
import { deleteAdminNews, bulkDeleteAdminNews } from '../../api/admin';

// NEW
import { 
  deactivateAdminNews, 
  activateAdminNews,
  deactivateAdminEvent,
  activateAdminEvent,
  deactivateAdminBook,
  activateAdminBook,
  deactivateAdminSession,
  activateAdminSession,
  deactivateAdminClub,
  activateAdminClub,
  deactivateAdminClubMember
} from '../../api/admin';
```

### Handler Implementation Pattern

**OLD PATTERN (Delete):**
```typescript
const handleDeleteNews = async (id: number) => {
  if (confirm('Tem a certeza que deseja eliminar esta notícia?')) {
    try {
      await deleteAdminNews(adminToken, id);
      // refresh list
    } catch (error) {
      console.error(error);
    }
  }
};
```

**NEW PATTERN (Deactivate):**
```typescript
const handleDeactivateNews = async (id: number) => {
  if (confirm('Tem a certeza que deseja desativar esta notícia?')) {
    try {
      const updated = await deactivateAdminNews(adminToken, id);
      // Update item in list with returned data
      setNews(news.map(item => item.id === id ? updated : item));
      pushToast({
        title: 'Notícia desativada',
        message: 'A notícia foi desativada com sucesso',
        tone: 'success'
      });
    } catch (error) {
      pushToast({
        title: 'Erro',
        message: 'Não foi possível desativar a notícia',
        tone: 'error'
      });
    }
  }
};

const handleActivateNews = async (id: number) => {
  try {
    const updated = await activateAdminNews(adminToken, id);
    setNews(news.map(item => item.id === id ? updated : item));
    pushToast({
      title: 'Notícia ativada',
      message: 'A notícia foi ativada com sucesso',
      tone: 'success'
    });
  } catch (error) {
    pushToast({
      title: 'Erro',
      message: 'Não foi possível ativar a notícia',
      tone: 'error'
    });
  }
};
```

## UI Button Changes

### Delete Button → Deactivate Button
```tsx
// OLD
<button onClick={() => handleDeleteNews(item.id)}>
  Eliminar
</button>

// NEW
{item.is_active ? (
  <button onClick={() => handleDeactivateNews(item.id)}>
    Desativar
  </button>
) : (
  <button onClick={() => handleActivateNews(item.id)}>
    Ativar
  </button>
)}
```

## Implementation Order

1. **Start with Users** (already has activate/deactivate - reference implementation)
2. **Update AdminCultura.tsx** (parent component)
3. **Update NewsPage.tsx** (most delete operations)
4. **Update ActivitiesPage.tsx** (books, events, sessions)
5. **Update ClubsPage.tsx**
6. **Test all flows**

## Notes

- All deactivate/activate functions now return the updated entity
- UI should reflect the new state immediately via state update
- Toast notifications will be shown automatically via central pushToast
- Confirmation dialogs should use new terminology: "Desativar" instead of "Eliminar"
- Inactive items will have `is_active = false` in the API response

## Backwards Compatibility

- Old DELETE endpoints still work (deprecated)
- New POST deactivate/activate endpoints are now preferred
- No breaking changes to API contract
- State management unchanged (still using React hooks)

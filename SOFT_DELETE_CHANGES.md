# Soft-Delete Unification - Backend Changes

## Overview
This refactoring unifies the approach to entity lifecycle management across the system. Instead of hard-deletes, we now use soft-delete through the `is_active` flag consistently across all entities.

## New Endpoints

### Users (Already Existing)
- `POST /api/auth/users/{id}/deactivate/` - Deactivate user
- `POST /api/auth/users/{id}/activate/` - Activate user

### Clubs
- `POST /api/clubs/admin/{id}/deactivate/` - Deactivate club
- `POST /api/clubs/admin/{id}/activate/` - Activate club

### Events
- `POST /api/events/admin/{id}/deactivate/` - Deactivate event
- `POST /api/events/admin/{id}/activate/` - Activate event

### News
- `POST /api/news/admin/{id}/deactivate/` - Deactivate news article
- `POST /api/news/admin/{id}/activate/` - Activate news article

### Books
- `POST /api/books/admin/{id}/deactivate/` - Deactivate book
- `POST /api/books/admin/{id}/activate/` - Activate book

### Sessions
- `POST /api/sessions/admin/{id}/deactivate/` - Deactivate session
- `POST /api/sessions/admin/{id}/activate/` - Activate session

### Club Members
- `POST /api/clubs/admin/{id}/members/{user_id}/deactivate/` - Remove user from club (sets club_id=NULL)

## Implementation Details

### Base Classes
- **SoftDeleteBaseMixin** (soft_delete_views.py) - Provides base functionality for soft-delete operations
- **AdminDeactivateView** - Generic view for deactivating entities
- **AdminActivateView** - Generic view for activating entities

### Entity-Specific Views
Located in `view_modules/soft_delete_entity_views.py`:
- AdminClubDeactivateView / AdminClubActivateView
- AdminEventDeactivateView / AdminEventActivateView
- AdminNewsDeactivateView / AdminNewsActivateView
- AdminBookDeactivateView / AdminBookActivateView
- AdminSessionDeactivateView / AdminSessionActivateView
- AdminClubMemberDeactivateView

### Audit Logging
All deactivate/activate operations are logged via `record_admin_audit_action()` with:
- Action: "deactivate" or "activate"
- Content-type: Entity type (club, event, news, book, session)
- User: Admin performing the action
- Timestamp: Automatic via Django

## Model Status

### Models with `is_active` Field
- AppUser ✓
- Club ✓
- Event ✓
- News ✓
- Book ✓
- Session ✓
- PhotoCarouselItem ✓
- NewsletterSubscriber ✓

## Migration Path
No new migrations needed - `is_active` field already exists on all relevant models.

## Deprecated Endpoints (Still Available but Should Use Soft-Delete)
- `POST /api/clubs/admin/{id}/members/{user_id}/` (DELETE method) - Replace with deactivate endpoint
- `DELETE /api/news/admin/bulk-delete/` - Replace with individual deactivate endpoints
- `DELETE /api/events/admin/bulk-delete/` - Replace with individual deactivate endpoints
- `DELETE /api/books/admin/bulk-delete/` - Replace with individual deactivate endpoints

## Testing
Run `./test_soft_delete.sh` to test all new endpoints (requires valid auth token).

## Frontend Integration
Frontend components should be updated to:
1. Call new POST endpoints instead of DELETE
2. Display "Deactivate" button instead of "Delete"
3. Display "Activate" button for inactive items
4. Use the new `/deactivate/` and `/activate/` route suffixes

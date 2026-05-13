from .admin.books import (
    AdminBookBulkDeleteView,
    AdminBookDetailView,
    AdminBookListCreateView,
)
from .admin.clubs import (
    AdminClubDetailView,
    AdminClubListCreateView,
    AdminClubMemberAssignView,
    AdminClubMemberRemoveView,
)
from .admin.content import (
    AdminCategoryDetailView,
    AdminCategoryListCreateView,
)
from .admin.dashboard import (
    AdminAuditLogListView,
    AdminDashboardNotificationsView,
    AdminDashboardSummaryView,
    AdminImageUploadView,
    AdminRegistrationStatusListView,
)
from .admin.events import (
    AdminEventBulkDeleteView,
    AdminEventBulkStatusUpdateView,
    AdminEventDetailView,
    AdminEventListCreateView,
)
from .admin.registrations import (
    AdminRegistrationBulkStatusUpdateView,
    AdminRegistrationListView,
    AdminRegistrationStatusUpdateView,
)
from .admin.sessions import (
    AdminSessionDetailView,
    AdminSessionListCreateView,
)

__all__ = [
    'AdminAuditLogListView',
    'AdminBookBulkDeleteView',
    'AdminBookDetailView',
    'AdminBookListCreateView',
    'AdminCategoryDetailView',
    'AdminCategoryListCreateView',
    'AdminClubDetailView',
    'AdminClubListCreateView',
    'AdminClubMemberAssignView',
    'AdminClubMemberRemoveView',
    'AdminDashboardNotificationsView',
    'AdminDashboardSummaryView',
    'AdminEventBulkDeleteView',
    'AdminEventBulkStatusUpdateView',
    'AdminEventDetailView',
    'AdminEventListCreateView',
    'AdminImageUploadView',
    'AdminRegistrationBulkStatusUpdateView',
    'AdminRegistrationListView',
    'AdminRegistrationStatusListView',
    'AdminRegistrationStatusUpdateView',
    'AdminSessionDetailView',
    'AdminSessionListCreateView',
]

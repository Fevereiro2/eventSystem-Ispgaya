from .admin.content import (
    AdminContentDetailView,
    AdminContentListCreateView,
)
from .admin.news import (
    AdminNewsBulkDeleteView,
    AdminNewsBulkStatusUpdateView,
    AdminNewsDetailView,
    AdminNewsListCreateView,
    AdminNewsStatusListView,
)

__all__ = [
    'AdminContentDetailView',
    'AdminContentListCreateView',
    'AdminNewsBulkDeleteView',
    'AdminNewsBulkStatusUpdateView',
    'AdminNewsDetailView',
    'AdminNewsListCreateView',
    'AdminNewsStatusListView',
]

from django.urls import path
from .views import (
    AdminContentDetailView,
    AdminContentListCreateView,
    AdminRoleListView,
    AdminUserDeactivateView,
    AdminUserDetailView,
    AdminUserListCreateView,
    LoginView,
    MeView,
    PublicContentListView,
)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/roles/', AdminRoleListView.as_view(), name='auth-roles'),
    path('auth/users/', AdminUserListCreateView.as_view(), name='auth-users'),
    path('auth/users/<int:pk>/', AdminUserDetailView.as_view(), name='auth-user-detail'),
    path('auth/users/<int:pk>/deactivate/', AdminUserDeactivateView.as_view(), name='auth-user-deactivate'),
    path('content/', PublicContentListView.as_view(), name='content-public-list'),
    path('content/admin/', AdminContentListCreateView.as_view(), name='content-admin-list-create'),
    path('content/admin/<uuid:pk>/', AdminContentDetailView.as_view(), name='content-admin-detail'),
]

from django.urls import path
from .views import (
    AdminContentDetailView,
    AdminContentListCreateView,
    LoginView,
    MeView,
    PublicContentListView,
)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('content/', PublicContentListView.as_view(), name='content-public-list'),
    path('content/admin/', AdminContentListCreateView.as_view(), name='content-admin-list-create'),
    path('content/admin/<uuid:pk>/', AdminContentDetailView.as_view(), name='content-admin-detail'),
]

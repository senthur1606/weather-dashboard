"""
SkyPulse Weather Dashboard - Main URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="SkyPulse Weather API",
        default_version='v1',
        description="""
        # SkyPulse Weather Dashboard API
        
        A comprehensive weather data API providing:
        - Real-time weather data
        - 7-day and hourly forecasts
        - Air quality index
        - Favorite cities management
        - User authentication via JWT
        - AI-powered weather recommendations
        """,
        terms_of_service="https://skypulse.app/terms/",
        contact=openapi.Contact(email="api@skypulse.app"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API v1
    path('api/', include('weather_api.urls')),

    # JWT Auth
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API Docs
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/schema/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]

# Serve static files in debug
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

"""
SkyPulse Weather Dashboard - Main URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)



urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API v1
    path('api/', include('weather_api.urls')),

    # JWT Auth
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name ='swagger-ui',),

    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc', ),
]

# Serve static files in debug
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

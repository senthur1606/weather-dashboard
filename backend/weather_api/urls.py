from django.urls import path
from . import views

app_name = 'weather_api'

urlpatterns = [
    # Utility
    path('health/', views.health_check, name='health'),
    path('token/verify/', views.verify_token, name='token-verify'),

    # Weather
    path('weather/current/', views.CurrentWeatherView.as_view(), name='current-weather'),
    path('weather/forecast/', views.ForecastView.as_view(), name='forecast'),
    path('weather/aqi/', views.AQIView.as_view(), name='aqi'),
    path('weather/search/', views.CitySearchView.as_view(), name='city-search'),
    path('weather/historical/', views.HistoricalView.as_view(), name='historical'),
    path('weather/alerts/', views.AlertsView.as_view(), name='alerts'),

    # Favorites (auth required)
    path('weather/favorites/', views.FavoritesView.as_view(), name='favorites'),
    path('weather/favorites/<str:city>/', views.FavoriteDetailView.as_view(), name='favorite-detail'),

    # AI & Export
    path('weather/recommendations/', views.RecommendationsView.as_view(), name='recommendations'),
    path('weather/export/', views.ExportReportView.as_view(), name='export'),
]

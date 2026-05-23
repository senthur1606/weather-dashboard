from django.apps import AppConfig


class WeatherApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'weather_api'
    verbose_name = 'Weather API'

    def ready(self):
        # Import signal handlers when app is ready
        try:
            import weather_api.signals  # noqa
        except ImportError:
            pass
